import type { SupabaseClient } from 'jsr:@supabase/supabase-js';

export async function saveChunks(
  input: {
    documentId: number;
    chunks: string[];
    embeddings: number[][];
  },
  supabase: SupabaseClient
) {
  const rows = input.chunks.map((content, i) => ({
    document_id: input.documentId,
    content,
    embedding: input.embeddings[i],
  }));

  const { data } = await supabase
    .from('document_chunks')
    .insert(rows)
    .select()
    .throwOnError();

  return data;
}
