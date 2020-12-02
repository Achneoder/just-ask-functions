export abstract class BaseError extends Error {
  public readonly httpStatus: number;

  constructor(statusCode?: number) {
    super();
    this.httpStatus = statusCode;
  }
}
