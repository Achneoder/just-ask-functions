import { ValidationError } from 'joi';
import { BaseError } from './base.error';

export class UnprocessableEntityError extends BaseError {
  public readonly validationError?: ValidationError;

  constructor(message?: string, validationError?: ValidationError) {
    super(422);
    this.message = message;
    this.validationError = validationError;
  }
}
