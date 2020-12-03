import { BucketListener } from '../core/bucket-listener';
import { BucketEvent } from '../core/interfaces/gcp/bucket-event.interface';
import { QuestionAssignmentEvent } from '../core/interfaces/question-assignment-event.interface';
import { QuestionPoolItem } from '../core/interfaces/question-pool-item.interface';
import { Question } from '../core/interfaces/question.interface';
import { publishToTopic } from '../core/pubsub/pubsub';

export class QuestionPublisher extends BucketListener<Question> {
  constructor(event: BucketEvent) {
    super(event);
  }

  public async exec(): Promise<void> {
    const splitName = this.event.name.split('/');
    const userId = splitName[0];
    const questionId = splitName[1].replace('.json', '');
    const questionPoolItem: QuestionPoolItem = {
      askedBy: userId,
      assignees: []
    };
    await BucketListener.objectWriter.writeObject(questionPoolItem, process.env.QUESTION_POOL_BUCKET, questionId);
    const questionAssignmentEvent: QuestionAssignmentEvent = { questionId };
    await publishToTopic(process.env.QUESTION_ASSIGNMENT_TOPIC, questionAssignmentEvent);
  }
}
