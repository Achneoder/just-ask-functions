import { BaseError } from './base.error';

export class ConflictError extends BaseError {
  constructor(message = 'email already exists') {
    super(409);
    this.message = message;
  }
}
