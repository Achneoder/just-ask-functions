import { EmailType } from '../emailType.enum';

export interface EmailTrigger {
  trigger: EmailType;
  firebaseUserId: string;
  callbackUri?: string;
}
