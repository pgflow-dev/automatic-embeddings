import { EdgeWorker } from '@pgflow/edge-worker';
import { GreetUser } from '../../flows/greet-user.ts';

EdgeWorker.start(GreetUser);
