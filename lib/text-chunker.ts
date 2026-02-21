export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { chunkSize = 500, chunkOverlap = 50 } = options;
  const chunks: string[] = [];
  
  if (!text || text.trim() === '') {
    return chunks;
  }

  let currentIndex = 0;

  while (currentIndex < text.length) {
    let endIndex = currentIndex + chunkSize;

    if (endIndex >= text.length) {
      chunks.push(text.substring(currentIndex).trim());
      break;
    }

    let breakIndex = endIndex;
    const minBreak = currentIndex + (chunkSize * 0.5);

    const lastNewline = text.lastIndexOf('\n', endIndex);
    const lastPeriod = text.lastIndexOf('. ', endIndex);
    const lastSpace = text.lastIndexOf(' ', endIndex);

    if (lastNewline > minBreak) {
      breakIndex = lastNewline;
    } else if (lastPeriod > minBreak) {
      breakIndex = lastPeriod + 1;
    } else if (lastSpace > minBreak) {
      breakIndex = lastSpace;
    }

    const chunk = text.substring(currentIndex, breakIndex).trim();
    if (chunk) chunks.push(chunk);
    let nextStart = breakIndex - chunkOverlap;
    if (nextStart > currentIndex) {
      const nextSpace = text.indexOf(' ', nextStart);
      if (nextSpace !== -1 && nextSpace < breakIndex) {
        nextStart = nextSpace + 1;
      }
    }
    
    currentIndex = Math.max(currentIndex + 1, nextStart);
  }

  return chunks;
}