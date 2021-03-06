import { Request, Response } from 'express';
import { autoBindSteps, loadFeature, StepDefinitions } from 'jest-cucumber';
import * as Function from '../../src/user-password-reset-api';
import { Container } from '../step-definitions/container';
import { steps } from '../step-definitions/core-steps';
import { getUserByEmailMock } from '../step-definitions/mocks';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: () => ({
    getUserByEmail: jest.fn(getUserByEmailMock)
  })
}));

const feature = loadFeature('./features/user-password-reset/user-password-reset.feature');

const whenRequestIsMadeToFunctionStepDefinitions: StepDefinitions = ({ when }) => {
  when(/a "([^"]*)" request is made to the function with body:/, async (httpMethod: string, data: string) => {
    const request = Container.get().getFunctionRequest();
    const response = Container.get().getFunctionResponse();
    request.method = httpMethod;
    request.body = JSON.parse(data);
    await Function.handleEvent(<Request>request, (<unknown>response) as Response);
  });
};

autoBindSteps([feature], [steps, whenRequestIsMadeToFunctionStepDefinitions]);
