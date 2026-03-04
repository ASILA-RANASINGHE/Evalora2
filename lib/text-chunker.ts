import { getEncoding } from 'js-tiktoken';

export interface ChunkOptions {
  maxTokens?: number;
  tokenOverlap?: number;
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { maxTokens = 500, tokenOverlap = 50 } = options;
  const chunks: string[] = [];
  
  if (!text || text.trim() === '') {
    return chunks;
  }

  const tokenizer = getEncoding("cl100k_base");

  const words = text.split(/\s+/);
  
  let currentChunkWords: string[] = [];
  let currentTokenCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    const wordTokens = tokenizer.encode(word + " ").length;

    if (currentTokenCount + wordTokens > maxTokens && currentChunkWords.length > 0) {
      chunks.push(currentChunkWords.join(" ").trim());

      let overlapWords: string[] = [];
      let overlapTokenCount = 0;
      
      for (let j = currentChunkWords.length - 1; j >= 0; j--) {
        const wTokens = tokenizer.encode(currentChunkWords[j] + " ").length;
        if (overlapTokenCount + wTokens > tokenOverlap) break;
        
        overlapWords.unshift(currentChunkWords[j]);
        overlapTokenCount += wTokens;
      }
      currentChunkWords = [...overlapWords, word];
      currentTokenCount = overlapTokenCount + wordTokens;
    } else {
      currentChunkWords.push(word);
      currentTokenCount += wordTokens;
    }
  }

  if (currentChunkWords.length > 0) {
    chunks.push(currentChunkWords.join(" ").trim());
  }

  return chunks;
}