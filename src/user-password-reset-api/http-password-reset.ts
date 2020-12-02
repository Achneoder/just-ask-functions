import { Request } from 'express';
import * as Joi from 'joi';
import { v4 } from 'uuid';
import { EmailType } from '../core/email/emailType.enum';
import { EmailTrigger } from '../core/email/interfaces/email-trigger.interface';
import { UnprocessableEntityError } from '../core/error/unprocessable-entity.error';
import { getUserByEmail } from '../core/firebase';
import { HttpBase } from '../core/http';
import { getModifiedCallBackUri } from '../core/utils';
import { RequestData } from './interfaces/request-data.interface';

export class HttpPasswordReset extends HttpBase<void> {
  constructor(request: Request) {
    super(request);
  }

  async validate<RequestData>(body: RequestData): Promise<RequestData> {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      callbackUri: Joi.string().optional()
    });

    const { error } = schema.validate(body, { allowUnknown: false });
    if (error) {
      throw new UnprocessableEntityError('input validation error', error);
    }
    return body;
  }

  public async getResponseData(): Promise<void> {
    const body: RequestData = await this.validate(this.request.body);
    const callbackUri = getModifiedCallBackUri(body, process.env.PASSWORD_RESET_CALLBACK);
    const user = await getUserByEmail(body.email);
    const emailTriggerData: EmailTrigger = {
      firebaseUserId: user.uid,
      trigger: EmailType.PASSWORD_RESET,
      callbackUri
    };
    await HttpBase.objectWriter.writeObject(
      emailTriggerData,
      process.env.EMAIL_TRIGGER_BUCKET,
      `${user.uid}/${v4()}.json`
    );
  }
}
