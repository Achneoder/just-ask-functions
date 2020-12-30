import { PubSubEvent } from '../core/interfaces/gcp/pubsub-event.interface';
import { QuestionAssigner } from './question-assigner';

export async function handleEvent(event: PubSubEvent): Promise<void> {
  try {
    await new QuestionAssigner(event).exec();
  } catch (err) {
    console.error(err.message);
    throw err;
  }
}
