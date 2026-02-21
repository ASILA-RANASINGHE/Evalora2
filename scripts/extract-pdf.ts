import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { extractText } from 'unpdf';

async function extractSamplePdf() {
  try {
    const filePath = path.join(process.cwd(), 'scripts', 'samples', 'history6.pdf');
    
    console.log(`📄 Loading PDF from: ${filePath}`);
    const pdfBuffer = readFileSync(filePath);

    console.log('⏳ Extracting text...');
    
    const { text, totalPages } = await extractText(new Uint8Array(pdfBuffer));

    console.log(`✅ Successfully parsed ${totalPages} pages.\n`);
    
    // Print the entire text to the console
    console.log('--- Full Extracted Text ---');
    console.log(text); 
    console.log('\n---------------------------');

    // Save the full text to a file so you can easily read it in VS Code
    const outputPath = path.join(process.cwd(), 'scripts', 'samples', 'history6-extracted.txt');
    writeFileSync(outputPath, Array.isArray(text) ? text.join('\n') : text);
    console.log(`💾 Full text saved to: ${outputPath}`);

  } catch (error) {
    console.error('❌ Failed to extract PDF:', error);
  }
}

extractSamplePdf();