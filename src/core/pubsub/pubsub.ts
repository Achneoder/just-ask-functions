import { PubSub } from '@google-cloud/pubsub';

let pubSub: PubSub;

function getPubSub(): PubSub {
  if (!pubSub) {
    pubSub = new PubSub();
  }
  return pubSub;
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function publishToTopic(topic: string, data: any): Promise<string> {
  return getPubSub().topic(topic).publishJSON(data);
}
