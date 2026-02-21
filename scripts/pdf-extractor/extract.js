const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extractText(inputPath) {
  const filePath = path.isAbsolute(inputPath) 
    ? inputPath 
    : path.join(__dirname, 'samples', inputPath);

  if (!fs.existsSync(filePath)) {
    console.error("❌ File not found at:", filePath);
    return null; 
  }

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    console.log(`------------------------------------------`);
    console.log(`📄 Processing: ${path.basename(filePath)}`);
    console.log(`🔢 Pages: ${data.numpages}`);

    const cleanText = data.text
        .replace(/\n\s*\n/g, '\n') 
        .trim();

    return {
      text: cleanText,
      pageCount: data.numpages,
      metadata: data.info
    };
    
  } catch (error) {
    console.error("❌ Error during PDF parsing:", error);
    throw error;
  }
}

module.exports = { extractText };