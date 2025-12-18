import { Flow } from 'npm:@pgflow/dsl/supabase';
import { splitChunks } from '../tasks/splitChunks.ts';
import { generateEmbedding } from '../tasks/generateEmbedding.ts';
import { saveChunks } from '../tasks/saveChunks.ts';

type Input = {
  documentId: number;
  content: string;
};

export const GenerateEmbeddings = new Flow<Input>({ slug: 'generateEmbeddings' })
  .array({ slug: 'chunks' }, (input) => splitChunks(input.run.content))
  .map({ slug: 'embeddings', array: 'chunks' }, (chunk) =>
    generateEmbedding(chunk)
  )
  .step({ slug: 'save', dependsOn: ['chunks', 'embeddings'] }, (input, context) =>
    saveChunks({
      documentId: input.run.documentId,
      chunks: input.chunks,
      embeddings: input.embeddings,
    }, context.supabase)
  );
