import { Request, Response } from 'express';
import { autoBindSteps, loadFeature, StepDefinitions } from 'jest-cucumber';
import * as Function from '../../src/user-activation-api';
import { Container } from '../step-definitions/container';
import { steps } from '../step-definitions/core-steps';
import { getUserMock, verifyIdTokenMock } from '../step-definitions/mocks';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: () => ({
    verifyIdToken: jest.fn(verifyIdTokenMock),
    getUser: jest.fn(getUserMock)
  })
}));

const feature = loadFeature('./features/user-activation/user-activation.feature');

const whenRequestIsMadeToFunctionStepDefinitions: StepDefinitions = ({ when }) => {
  when(/a "([^"]*)" request is made to the function/, async (httpMethod: string) => {
    const request = Container.get().getFunctionRequest();
    const response = Container.get().getFunctionResponse();
    request.method = httpMethod;
    await Function.handleEvent(<Request>request, (<unknown>response) as Response);
  });
};

autoBindSteps([feature], [steps, whenRequestIsMadeToFunctionStepDefinitions]);
