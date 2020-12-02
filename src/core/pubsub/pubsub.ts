import { PubSub } from '@google-cloud/pubsub';

let pubSub: PubSub;

function getPubSub(): PubSub {
  if (!pubSub) {
    pubSub = new PubSub();
  }
  return pubSub;
}

export function publishToTopic(topic: string, data: any): Promise<string> {
  return getPubSub().topic(topic).publishJSON(data);
}
