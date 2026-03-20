import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { extractText } from 'unpdf';
import { cleanPdfText } from '../lib/text-cleaner';
import { chunkText } from '../lib/text-chunker';

async function extractSamplePdf() {
  try {
    const filePath = path.join(process.cwd(), 'scripts', 'samples', 'history6.pdf');
    
    console.log(`Loading PDF from: ${filePath}`);
    const pdfBuffer = readFileSync(filePath);

    console.log('Extracting text...');
    const { text, totalPages } = await extractText(new Uint8Array(pdfBuffer));

    console.log(`Successfully parsed ${totalPages} pages.\n`);
    
    const rawTextString = Array.isArray(text) ? text.join('\n') : text;
    
    console.log('Cleaning up messy PDF text...');
    const cleanedText = cleanPdfText(rawTextString);

    console.log('Chunking text...');
    const chunks = chunkText(cleanedText);
    console.log(`Generated ${chunks.length} chunks.\n`);

    const outputPath = path.join(process.cwd(), 'scripts', 'samples', 'history6-chunks.json');
    writeFileSync(outputPath, JSON.stringify(chunks, null, 2));
    
    console.log(`Chunks saved to: ${outputPath}\n`);

  } catch (error) {
    console.error('Failed to extract PDF:', error);
  }
}

extractSamplePdf();