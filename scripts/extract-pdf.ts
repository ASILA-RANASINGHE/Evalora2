import { readFileSync } from 'fs';
import path from 'path';
import { extractText } from 'unpdf';

async function extractSamplePdf() {
  try {
    // Dynamically resolve the path to your existing sample PDF
    const filePath = path.join(process.cwd(), 'scripts', 'samples', 'history6.pdf');
    
    console.log(`📄 Loading PDF from: ${filePath}`);
    const pdfBuffer = readFileSync(filePath);

    console.log('⏳ Extracting text...');
    
    // unpdf parses the raw buffer
    const { text, totalPages } = await extractText(new Uint8Array(pdfBuffer));

    console.log(`✅ Successfully parsed ${totalPages} pages.\n`);
    console.log('--- Text Preview (First 500 characters) ---');
    console.log(text.join('').substring(0, 500) + '...\n');
    console.log('-------------------------------------------');

  } catch (error) {
    console.error('❌ Failed to extract PDF:', error);
  }
}

extractSamplePdf();