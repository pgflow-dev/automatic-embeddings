import { openai } from 'npm:@ai-sdk/openai';
import { embed } from 'npm:ai';

export async function generateEmbedding(chunk: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: chunk,
  });

  return embedding;
}
