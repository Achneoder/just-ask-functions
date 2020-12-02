import { Request } from 'express';
import * as admin from 'firebase-admin';
import { ObjectReader, ObjectWriter } from 'gcp-object-storage';
import { UnauthorizedError } from './error/unauthorized.error';

export abstract class HttpBase<K> {
  private static firebaseInitialized = false;
  protected static objectReader: ObjectReader;
  protected static objectWriter: ObjectWriter;

  protected readonly request: Request;

  constructor(request: Request) {
    if (!HttpBase.objectReader || HttpBase.objectWriter) {
      HttpBase.objectReader = new ObjectReader();
      HttpBase.objectWriter = new ObjectWriter();
    }
    if (!HttpBase.firebaseInitialized) {
      admin.initializeApp();
      HttpBase.firebaseInitialized = true;
    }
    this.request = request;
  }

  /**
   * Validates the request body.
   *
   * Implement your custom validation logic here.
   * @param body
   */
  protected abstract validate<T>(body: T): Promise<T>;

  /**
   * Returns the data that should be returned by the Response.
   *
   * Add your main logic here
   */
  public abstract getResponseData(): Promise<K>;

  /**
   * Check the Request for set Bearer Token in Authorization header, verifies it and returns the userId
   */
  protected async getAuthorizeUserId(): Promise<string> {
    try {
      const idToken = this.request.get('Authorization').split('Bearer ')?.[1];
      return (await admin.auth().verifyIdToken(idToken)).sub;
    } catch (err) {
      console.error(err);
      throw new UnauthorizedError();
    }
  }
}
