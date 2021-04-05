import { listAllUserIds } from '../core/firebase';
import { PubSubEvent } from '../core/interfaces/gcp/pubsub-event.interface';
import { QuestionPoolItem } from '../core/interfaces/question-pool-item.interface';
import { Question } from '../core/interfaces/question.interface';
import { PubSubListener } from '../core/pub-sub-listener';

export class QuestionAssigner extends PubSubListener<{ questionId: string }> {
  constructor(event: PubSubEvent) {
    super(event);
  }

  public async exec(): Promise<void> {
    const questionPoolItem = await PubSubListener.objectReader.readObject<QuestionPoolItem>(
      process.env.QUESTION_POOL_BUCKET,
      `${this.eventData.questionId}.json`
    );

    const question = await PubSubListener.objectReader.readObject<Question>(
      process.env.OWN_QUESTIONS_BUCKET,
      `${questionPoolItem.askedBy}/${this.eventData.questionId}.json`
    );
    const excludedUsers = [questionPoolItem.askedBy, ...questionPoolItem.assignees];
    const allUser = await listAllUserIds();
    const allAvailableUsers = allUser.filter((userId: string) => !excludedUsers.includes(userId));
    let selectedUser: string;
    if(allAvailableUsers.length) {
      selectedUser = allAvailableUsers[Math.floor(Math.random() * allAvailableUsers.length)];
    } else {
      const allUsersButAsking = allUser.filter((userId: string) => userId !== questionPoolItem.askedBy);
      selectedUser = allUsersButAsking[Math.floor(Math.random() * allUsersButAsking.length)];
    }
    questionPoolItem.assignees.push(selectedUser);
    await PubSubListener.objectWriter.writeObject(
      questionPoolItem,
      process.env.QUESTION_POOL_BUCKET,
      this.eventData.questionId
    );
    await PubSubListener.objectWriter.writeObject(
      question,
      process.env.ASSIGNED_QUESTIONS_BUCKET,
      `${selectedUser}/${this.eventData.questionId}.json`
    );
  }
}
