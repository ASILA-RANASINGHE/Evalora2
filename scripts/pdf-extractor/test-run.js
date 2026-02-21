const { extractText } = require('./extract');
const path = require('path');

// Pass only the filename, not the full path
const fileName = 'Grade6_History.pdf'; 

extractText(fileName)
  .then(res => {
    // Crucial null check to prevent crashes if the file isn't found
    if (res && res.text) {
      console.log("✅ EXTRACTION SUCCESSFUL!");
      console.log("Character Count:", res.text.length);
      console.log("Snippet:", res.text.substring(0, 300) + "...");
    } else {
      console.log("⚠️ Extraction failed: No data returned from file.");
    }
  })
  .catch(err => {
    console.error("❌ Script Error:", err.message);
  });