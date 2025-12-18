import { EdgeWorker } from 'jsr:@pgflow/edge-worker';
import { GenerateEmbeddings } from '../../flows/generate-embeddings.ts';

EdgeWorker.start(GenerateEmbeddings);
