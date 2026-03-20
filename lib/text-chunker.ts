import { getEncoding } from 'js-tiktoken';

export interface ChunkOptions {
  maxTokens?: number;
  tokenOverlap?: number;
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { maxTokens = 500, tokenOverlap = 50 } = options;
  
  if (!text || text.trim() === '') {
    return [];
  }
  const tokenizer = getEncoding("cl100k_base");
  const tokens = tokenizer.encode(text);
  const chunks: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    const chunkTokens = tokens.slice(i, i + maxTokens);
    chunks.push(tokenizer.decode(chunkTokens));
    i += (maxTokens - tokenOverlap);
  }

  return chunks;
}