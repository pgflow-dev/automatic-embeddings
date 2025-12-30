import { EdgeWorker } from 'jsr:@pgflow/edge-worker@0.12.0';
import { GenerateEmbeddings } from '../../flows/generate-embeddings.ts';

EdgeWorker.start(GenerateEmbeddings);
