import type { SupabaseClient } from 'jsr:@supabase/supabase-js';

export async function deleteOldChunks(
  input: {
    documentId: number;
    newChunkIds: number[];
  },
  supabase: SupabaseClient
): Promise<void> {
  // Delete all chunks for this document that are NOT in the new chunk IDs list
  await supabase
    .from('document_chunks')
    .delete()
    .not('id', `in.(${input.newChunkIds.join(',')})`)
    .eq('document_id', input.documentId)
    .throwOnError();
}
