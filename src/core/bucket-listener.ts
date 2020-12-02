import { Request } from 'express';
import * as admin from 'firebase-admin';
import { ObjectReader, ObjectWriter } from 'gcp-object-storage';
import { UnauthorizedError } from './error/unauthorized.error';
import { BucketEvent } from './interfaces/gcp/bucket-event.interface';

export abstract class BucketListener<K> {
  private static firebaseInitialized = false;
  protected static objectReader: ObjectReader;
  protected static objectWriter: ObjectWriter;

  protected readonly event: BucketEvent;

  constructor(event: BucketEvent) {
    if (!BucketListener.objectReader || BucketListener.objectWriter) {
      BucketListener.objectReader = new ObjectReader();
      BucketListener.objectWriter = new ObjectWriter();
    }
    if (!BucketListener.firebaseInitialized) {
      admin.initializeApp();
      BucketListener.firebaseInitialized = true;
    }
    this.event = event;
  }

  protected getTriggeredFile(): Promise<K> {
    return BucketListener.objectReader.readObject(this.event.bucket, this.event.name);
  }

  /**
   * Should be called in the index.ts and contain your main logic.
   *
   * Add your main logic here
   */
  public abstract exec(): Promise<void>;
}
