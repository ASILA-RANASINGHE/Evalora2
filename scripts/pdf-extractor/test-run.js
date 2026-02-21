const { getPdfText } = require('./extractor');
const path = require('path');

const samplePath = path.join(__dirname, 'samples', 'Grade6_History.pdf');

getPdfText(samplePath)
  .then(text => {
    console.log("Extraction Successful!");
    console.log("Text Length:", text.length);
  })
  .catch(err => console.error("Test Failed:", err));