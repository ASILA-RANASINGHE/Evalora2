const fs = require('fs');
const path = require('path');

async function extractText(fileName) {
  const filePath = path.join(__dirname, 'samples', fileName);
  
  if (!fs.existsSync(filePath)) {
    console.error("File not found:", filePath);
    return;
  }

  const dataBuffer = fs.readFileSync(filePath);
  console.log(`Buffer created for ${fileName}, size: ${dataBuffer.length} bytes`);
}

extractText('Grade6_History.pdf');