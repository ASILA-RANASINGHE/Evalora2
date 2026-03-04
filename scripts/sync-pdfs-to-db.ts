import { extractText } from 'unpdf';
import { cleanPdfText } from '../lib/text-cleaner';
import { chunkText } from '../lib/text-chunker';
import { getPdfListFromBucket, downloadPdfAsBuffer } from './process-supabase-pdfs';

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

      const pdfBuffer = await downloadPdfAsBuffer(fileName);

      console.log('⏳ Extracting text...');
      const { text, totalPages } = await extractText(pdfBuffer);
      console.log(`✅ Parsed ${totalPages} pages.`);

      const rawTextString = Array.isArray(text) ? text.join('\n') : text;

      console.log('🧹 Cleaning text...');
      const cleanedText = cleanPdfText(rawTextString);

      console.log('✂️ Chunking text...');
      const chunks = chunkText(cleanedText);
      console.log(`✅ Generated ${chunks.length} chunks for ${fileName}.`);

      const { title, grade, topic } = extractMetadataFromFilename(fileName);

      if (chunks.length > 0) {
        console.log(`\n🔍 Preview of first chunk to save:`);
        console.log({
          title,
          topic,
          grade,
          contentPreview: chunks[0].substring(0, 50) + '...'
        });
      }
    }
    
    console.log(`\n🎉 Pipeline dry-run complete!`);

  } catch (error) {
    console.error('❌ Pipeline failed:', error);
  }
}

runPipeline();