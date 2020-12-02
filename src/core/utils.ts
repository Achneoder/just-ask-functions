import { CallbackURIRequest } from './interfaces/callback-uri-request.interface';

export function getModifiedCallBackUri<T extends CallbackURIRequest>(body: T, fallbackUri: string): string | undefined {
  if (process.env.STAGE === 'test' && body.callbackUri) {
    return body.callbackUri;
  }
  return fallbackUri;
}
