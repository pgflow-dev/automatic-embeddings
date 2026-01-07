import { Flow } from 'npm:@pgflow/dsl@0.12.0/supabase';
import { splitChunks } from '../tasks/splitChunks.ts';
import { generateEmbedding } from '../tasks/generateEmbedding.ts';
import { saveChunks } from '../tasks/saveChunks.ts';
import { deleteOldChunks } from '../tasks/deleteOldChunks.ts';

type Input = {
  documentId: number;
  content: string;
};

export const UpdateEmbeddings = new Flow<Input>({ slug: 'updateEmbeddings' })
  .array({ slug: 'chunks' }, (flowInput) => splitChunks(flowInput.content))
  .map({ slug: 'embeddings', array: 'chunks' }, (chunk) =>
    generateEmbedding(chunk)
  )
  .step({ slug: 'save', dependsOn: ['chunks', 'embeddings'] }, async (deps, ctx) => {
    const flowInput = await ctx.flowInput;
    return saveChunks({
      documentId: flowInput.documentId,
      chunks: deps.chunks,
      embeddings: deps.embeddings,
    }, ctx.supabase);
  })
  .step({ slug: 'cleanup', dependsOn: ['save'] }, async (deps, ctx) => {
    const flowInput = await ctx.flowInput;
    return deleteOldChunks({
      documentId: flowInput.documentId,
      newChunkIds: deps.save,
    }, ctx.supabase);
  });
