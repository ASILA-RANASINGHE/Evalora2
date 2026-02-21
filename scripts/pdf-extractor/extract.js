const fs = require('fs');
const path = require('path');
console.log("Pages:", data.numpages);

async function extractText(fileName) {
  const filePath = path.join(__dirname, 'samples', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return;
  }

  const dataBuffer = fs.readFileSync(filePath);
  try {
    console.log("Pages:", data.numpages);
    console.log("Pages:", data.numpages);
    console.log("Pages:", data.numpages);
    console.log("--- Extracted Text ---");
    
    const cleanText = data.text
        .replace(/\n\s*\n/g, '\n')
        .trim();
    console.log(cleanText);
    
  } catch (error) {
    console.error("Error extracting text:", error);
  }
}

extractText('Grade6_History.pdf');