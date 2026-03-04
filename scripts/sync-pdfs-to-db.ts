import { extractText } from 'unpdf';
import { cleanPdfText } from '../lib/text-cleaner';
import { chunkText } from '../lib/text-chunker';
import { getPdfListFromBucket, downloadPdfAsBuffer } from './process-supabase-pdfs';
import { prisma } from '../lib/prisma';

function extractMetadataFromFilename(fileName: string) {
  const title = fileName.replace('.pdf', '');
  const gradeMatch = title.match(/Grade\s*(\d+)/i);
  const grade = gradeMatch ? `Grade ${gradeMatch[1]}` : null;
  const topic = title.toLowerCase().includes('history') ? 'History' : null;

  return { title, grade, topic };
}

async function runPipeline() {
  try {
    console.log('🚀 Starting PDF Processing Pipeline...');
    const pdfFiles = await getPdfListFromBucket();

    for (const fileName of pdfFiles) {
      console.log(`\n======================================`);
      console.log(`📄 Processing: ${fileName}`);

      try {
        const pdfBuffer = await downloadPdfAsBuffer(fileName);
        
        console.log('⏳ Extracting text...');
        const { text } = await extractText(pdfBuffer);
        const rawTextString = Array.isArray(text) ? text.join('\n') : text;

        console.log('🧹 Cleaning text...');
        const cleanedText = cleanPdfText(rawTextString);

        console.log('✂️ Chunking text...');
        const chunks = chunkText(cleanedText);
        
        if (chunks.length === 0) {
          console.log(`⚠️ No text found in ${fileName}. Skipping database insertion.`);
          continue;
        }

        const { title, grade, topic } = extractMetadataFromFilename(fileName);

        console.log(`💾 Preparing ${chunks.length} chunks for the database...`);

        const dbRecords = chunks.map((chunkText) => ({
          title: title,
          topic: topic,
          grade: grade,
          content: chunkText,
        }));

        const result = await prisma.documentChunk.createMany({
          data: dbRecords,
        });

        console.log(`✅ Successfully saved ${result.count} chunks to the database!`);

      } catch (fileError) {
        console.error(`❌ Failed processing ${fileName}:`, fileError);
      }
    }
    
    console.log(`\n🎉 Pipeline complete! All PDFs have been chunked and stored.`);

  } catch (error) {
    console.error('❌ Pipeline encountered a fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runPipeline();