import { BucketEvent } from '../core/interfaces/gcp/bucket-event.interface';
import { QuestionPublisher } from './question-publisher';

export async function handleEvent(event: BucketEvent) {
  try {
    await new QuestionPublisher(event).exec();
  } catch (err) {
    console.error(err.message);
  }
}
