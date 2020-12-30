import { BucketEvent } from '../core/interfaces/gcp/bucket-event.interface';
import { AnswerPublisher } from './answer-publisher';

export async function handleEvent(event: BucketEvent): Promise<void> {
  try {
    await new AnswerPublisher(event).exec();
  } catch (err) {
    console.error(err.message);
  }
}
