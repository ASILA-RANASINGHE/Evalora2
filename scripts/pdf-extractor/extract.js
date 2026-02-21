const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extractText(fileName) {
  const filePath = path.join(__dirname, 'samples', fileName);

  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return null;
  }

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    console.log(`Processing: ${fileName}`);
    console.log("Pages:", data.numpages);

    const cleanText = data.text
        .replace(/\n\s*\n/g, '\n')
        .trim();

    return {
      text: cleanText,
      pageCount: data.numpages,
      metadata: data.info
    };
    
  } catch (error) {
    console.error("Error extracting text:", error);
    throw error;
  }
}

module.exports = { extractText };