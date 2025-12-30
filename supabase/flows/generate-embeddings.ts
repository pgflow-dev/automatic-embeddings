import { Flow } from 'npm:@pgflow/dsl@0.12.0/supabase';
import { splitChunks } from '../tasks/splitChunks.ts';
import { generateEmbedding } from '../tasks/generateEmbedding.ts';
import { saveChunks } from '../tasks/saveChunks.ts';

type Input = {
  documentId: number;
  content: string;
};

export const GenerateEmbeddings = new Flow<Input>({ slug: 'generateEmbeddings' })
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
  });
