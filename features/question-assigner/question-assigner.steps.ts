import { autoBindSteps, loadFeature } from 'jest-cucumber';
import { handleEvent } from '../../src/question-assigner';
import { Container } from '../step-definitions/container';
import { steps } from '../step-definitions/core-steps';
import { createUserMock, listUsersMock } from '../step-definitions/mocks';

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

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: () => ({
    listUsers: jest.fn(listUsersMock)
  })
}));

const feature = loadFeature('./features/question-assigner/question-assigner.feature', {
  tagFilter: 'not @excluded'
});

const whenEventTriggered = ({ when }) => {
  when(/^the function is triggered by Pub\/Sub event with payload:$/, async (payload: string) => {
    await handleEvent({ data: Buffer.from(payload).toString('base64') });
  });
};

const thenRememberedFilenameShouldStartWith = ({ then }) => {
  then(
    /^this filename should start with last element of "(.*)" of file "(.*)" in bucket "(.*)"$/,
    (referencedAttribute: string, referencedFilename: string, referencedBucket: string) => {
      const rememberedFile = Container.get().getRememberedFile();
      const buckets = Container.get().getBucketData();
      const expectedValue = buckets[referencedBucket][referencedFilename].data[referencedAttribute].slice(-1).pop();
      expect(rememberedFile.fileName.startsWith(expectedValue)).toBeTruthy();
    }
  );
};

autoBindSteps([feature], [steps, whenEventTriggered, thenRememberedFilenameShouldStartWith]);
