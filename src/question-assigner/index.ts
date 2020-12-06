import { QuestionAssigner } from './question-assigner';

export async function handleEvent(event: { data: any }) {
  try {
    await new QuestionAssigner(event).exec();
  } catch (err) {
    console.error(err.message);
    throw err
  }
}
