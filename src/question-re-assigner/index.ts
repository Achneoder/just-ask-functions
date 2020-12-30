import { BucketEvent } from '../core/interfaces/gcp/bucket-event.interface';
import { QuestionReAssigner } from './question-re-assigner';

export async function handleEvent(event: BucketEvent) {
  try {
    await new QuestionReAssigner(event).exec();
  } catch (err) {
    console.error(err.message);
  }
}
