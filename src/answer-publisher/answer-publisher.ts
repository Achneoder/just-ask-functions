import { BucketListener } from '../core/bucket-listener';
import { Answer } from '../core/interfaces/answer.interface';
import { BucketEvent } from '../core/interfaces/gcp/bucket-event.interface';
import { QuestionPoolItem } from '../core/interfaces/question-pool-item.interface';
import { Question } from '../core/interfaces/question.interface';

export class AnswerPublisher extends BucketListener<Question> {
  constructor(event: BucketEvent) {
    super(event);
  }

  public async exec(): Promise<void> {
    const splitName = this.event.name.split('/');
    const answeredUserId = splitName[0];
    const questionId = splitName[1];
    const answerId = splitName[2];
    const { poolItem, answer } = await Promise.all([
      BucketListener.objectReader.readObject<QuestionPoolItem>(process.env.QUESTION_POOL_BUCKET, `${questionId}.json`),
      BucketListener.objectReader.readObject<Answer>(this.event.bucket, this.event.name)
    ]).then((elements: [QuestionPoolItem, Answer]) => ({ poolItem: elements[0], answer: elements[1] }));
    await BucketListener.objectWriter.writeObject(
      answer,
      process.env.RECEIVED_ANSWERS_BUCKET,
      `${poolItem.askedBy}/${questionId}/${answeredUserId}/${answerId}`
    );
  }
}
