import { BaseError } from './base.error';

export class UnauthorizedError extends BaseError {
  public readonly status = 401;

  constructor(message?: string) {
    super(401);
    this.message = message || 'the user is not authorized';
  }
}
