import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { extractText } from 'unpdf';
import { cleanPdfText } from '../lib/text-cleaner';
import { chunkText } from '../lib/text-chunker';
import { getPdfListFromBucket, downloadPdfAsBuffer } from './process-supabase-pdfs';
import { prisma } from '../lib/prisma';

const CACHE_FILE = path.join(process.cwd(), 'scripts', 'processed-files.json');
const DLQ_FILE = path.join(process.cwd(), 'scripts', 'failed-files.json');

interface FailedFileLog {
  fileName: string;
  error: string;
  timestamp: string;
}

function getProcessedFiles(): string[] {
  if (existsSync(CACHE_FILE)) {
    const data = readFileSync(CACHE_FILE, 'utf8');
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }
  return [];
}

function markFileAsProcessed(fileName: string, processedList: string[]) {
  processedList.push(fileName);
  writeFileSync(CACHE_FILE, JSON.stringify(processedList, null, 2), 'utf8');
}

function logToDeadLetterQueue(fileName: string, errorMsg: string) {
  let failedFiles: FailedFileLog[] = [];
  
  if (existsSync(DLQ_FILE)) {
    try {
      failedFiles = JSON.parse(readFileSync(DLQ_FILE, 'utf8'));
    } catch (e) {
      failedFiles = [];
    }
  }
  
  failedFiles = failedFiles.filter(f => f.fileName !== fileName);
  
  failedFiles.push({
    fileName,
    error: errorMsg,
    timestamp: new Date().toISOString()
  });
  
  writeFileSync(DLQ_FILE, JSON.stringify(failedFiles, null, 2), 'utf8');
}

function extractMetadataFromFilename(fileName: string) {
  const title = fileName.replace('.pdf', '');
  const gradeMatch = title.match(/Grade\s*(\d+)/i);
  const grade = gradeMatch ? `Grade ${gradeMatch[1]}` : null;
  const topic = title.toLowerCase().includes('history') ? 'History' : null;

  return { title, grade, topic };
}

async function runPipeline() {
  try {
    console.log('Starting PDF Processing Pipeline...');
    
    const processedFiles = getProcessedFiles();
    console.log(`Loaded ${processedFiles.length} previously processed files from cache.`);

    const pdfFiles = await getPdfListFromBucket();

    for (const fileName of pdfFiles) {
      console.log('\n======================================');
      console.log(`Processing: ${fileName}`);

      if (processedFiles.includes(fileName)) {
        console.log(`Skipping ${fileName}: Already processed.`);
        continue;
      }

      try {
        const pdfBuffer = await downloadPdfAsBuffer(fileName);
        
        console.log('Extracting text...');
        const { text } = await extractText(pdfBuffer);
        const rawTextString = Array.isArray(text) ? text.join('\n') : text;

        console.log('Cleaning text...');
        const cleanedText = cleanPdfText(rawTextString);

        console.log('Chunking text...');
        const chunks = chunkText(cleanedText);
        
        if (chunks.length === 0) {
          console.log(`No text found in ${fileName}. Skipping database insertion.`);
          logToDeadLetterQueue(fileName, "Extracted text was completely empty.");
          continue;
        }

        const { title, grade, topic } = extractMetadataFromFilename(fileName);

        console.log(`Preparing ${chunks.length} chunks for the database...`);

        const dbRecords = chunks.map((chunkText) => ({
          title: title,
          topic: topic,
          grade: grade,
          content: chunkText,
        }));

        const result = await prisma.documentChunk.createMany({
          data: dbRecords,
        });

        console.log(`Successfully saved ${result.count} chunks to the database!`);

        markFileAsProcessed(fileName, processedFiles);
        console.log(`Marked ${fileName} as processed in cache.`);

      } catch (fileError: any) {
        console.error(`Failed processing ${fileName}. Adding to DLQ.`);
        const errorMessage = fileError?.message || String(fileError);
        logToDeadLetterQueue(fileName, errorMessage);
      }
    }
    
    console.log('\nPipeline complete! All valid PDFs have been processed.');
    if (existsSync(DLQ_FILE)) {
      console.log(`Check ${DLQ_FILE} for any files that failed during processing.`);
    }

  } catch (error) {
    console.error('Pipeline encountered a fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runPipeline();