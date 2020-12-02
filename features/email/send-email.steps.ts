import { autoBindSteps, loadFeature } from 'jest-cucumber';
import { handleEvent } from '../../src/email';
import { Container } from '../step-definitions/container';
import { steps } from '../step-definitions/core-steps';
import {
  generateEmailVerificationLinkMock,
  generatePasswordResetLinkMock,
  getUserMock
} from '../step-definitions/mocks';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: () => ({
    getUser: jest.fn(getUserMock),
    generateEmailVerificationLink: jest.fn(generateEmailVerificationLinkMock),
    generatePasswordResetLink: jest.fn(generatePasswordResetLinkMock)
  })
}));

const feature = loadFeature('./features/email/send-email.feature');

const whenEventTriggered = ({ when }) => {
  when(/^a write event for file "(.*)" is triggered on bucket "(.*)"$/, async (filename: string, bucket: string) => {
    await handleEvent({
      bucket,
      name: filename
    });
  });
};

const thenEmailIsSentToWithContent = ({ then }) => {
  then(/an email should be sent to "([^"]*)" containing text "([^"]*)"/, (email: string, text: string) => {
    const sentMail = Container.get().getSentMail();
    expect(sentMail.to).toEqual(email);
    expect(sentMail.body.includes(text)).toBeTruthy();
  });
};
autoBindSteps([feature], [steps, whenEventTriggered, thenEmailIsSentToWithContent]);
