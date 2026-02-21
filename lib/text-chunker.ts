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
    const chunk = text.substring(currentIndex, currentIndex + chunkSize);
    chunks.push(chunk);
    currentIndex += (chunkSize - chunkOverlap);
  }

  return chunks;
}