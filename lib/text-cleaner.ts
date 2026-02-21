export function cleanPdfText(rawText: string): string {
  return rawText
    // 1. Remove hidden/control characters (keeps standard text, newlines, tabs)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '')
    // 2. Normalize carriage returns to standard newlines
    .replace(/\r\n/g, '\n')
    // 3. Replace 2 or more spaces/tabs with a single space
    .replace(/[ \t]{2,}/g, ' ')
    // 4. Collapse 3 or more consecutive newlines into exactly 2 (preserves paragraph breaks)
    .replace(/\n{3,}/g, '\n\n')
    // 5. Clean up stray spaces at the start or end of the document
    .trim();
}