import { autoBindSteps, loadFeature, StepDefinitions } from 'jest-cucumber';
import { Request, Response } from 'express';
import * as UserRegistration from '../../src/user-registration-api';
import { Container } from '../step-definitions/container';
import { steps } from '../step-definitions/core-steps';
import { createUserMock } from '../step-definitions/mocks';

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  auth: () => ({
    createUser: jest.fn(createUserMock)
  })
}));

const feature = loadFeature('./features/user-registration/user-registration.feature');

const whenRequestIsMadeToFunctionStepDefinitions: StepDefinitions = ({ when }) => {
  when(/a "([^"]*)" request is made to the function with body:/, async (httpMethod: string, data: string) => {
    const request = Container.get().getFunctionRequest();
    const response = Container.get().getFunctionResponse();
    request.method = httpMethod;
    request.body = JSON.parse(data);
    await UserRegistration.handleEvent(<Request>request, (<unknown>response) as Response);
  });
};

autoBindSteps([feature], [steps, whenRequestIsMadeToFunctionStepDefinitions]);
