export function cleanPdfText(rawText: string): string {
  return rawText
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/([a-zA-Z]+)-\s*\n\s*([a-zA-Z]+)/g, '$1$2')
    .replace(/^\s*\d+\s*$/gm, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}