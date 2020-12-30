import { autoBindSteps, loadFeature } from 'jest-cucumber';
import { handleEvent } from '../../src/question-re-assigner';
import { Container } from '../step-definitions/container';
import { steps } from '../step-definitions/core-steps';

jest.mock('@google-cloud/pubsub', () => ({
  PubSub: jest.fn(() => ({
    topic: jest.fn((targetTopic: string) => {
      return {
        publishJSON: jest.fn((data: any) => {
          const message = Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
          Container.get().addPubSubData(targetTopic, message);
          return Promise.resolve(message);
        })
      };
    })
  }))
}));

const feature = loadFeature('./features/question-re-assigner/question-re-assigner.feature');

const whenEventTriggered = ({ when }) => {
  when(/^a delete event for file "(.*)" is triggered on bucket "(.*)"$/, async (filename: string, bucket: string) => {
    await handleEvent({
      bucket,
      name: filename
    });
  });
};

autoBindSteps([feature], [steps, whenEventTriggered]);
