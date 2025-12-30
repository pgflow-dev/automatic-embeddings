import { EdgeWorker } from 'jsr:@pgflow/edge-worker@0.12.0';
import { GreetUser } from '../../flows/greet-user.ts';

EdgeWorker.start(GreetUser);
