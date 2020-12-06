import * as admin from 'firebase-admin';
import { ObjectReader, ObjectWriter } from 'gcp-object-storage';

export abstract class PubSubListener<K> {
  private static firebaseInitialized = false;
  protected static objectReader: ObjectReader;
  protected static objectWriter: ObjectWriter;

  protected readonly eventData: K;

  constructor(event: any) {
    if (!PubSubListener.objectReader || PubSubListener.objectWriter) {
      PubSubListener.objectReader = new ObjectReader();
      PubSubListener.objectWriter = new ObjectWriter();
    }
    if (!PubSubListener.firebaseInitialized) {
      admin.initializeApp();
      PubSubListener.firebaseInitialized = true;
    }

    this.eventData = JSON.parse(
      Buffer.from(event.data, 'base64').toString()
    );
  }

  /**
   * Should be called in the index.ts and contain your main logic.
   *
   * Add your main logic here
   */
  public abstract exec(): Promise<void>;
}
