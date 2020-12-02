import { Request } from 'express';
import * as Joi from 'joi';
import { EmailType } from '../core/email/emailType.enum';
import { EmailTrigger } from '../core/email/interfaces/email-trigger.interface';
import { UnprocessableEntityError } from '../core/error/unprocessable-entity.error';
import { createUser } from '../core/firebase';
import { HttpBase } from '../core/http';
import { AccountData } from '../core/interfaces/account-data.interface';
import { Language } from '../core/language.enum';
import { getModifiedCallBackUri } from '../core/utils';
import { RequestData } from './interfaces/request-data.interface';
import { v4 } from 'uuid';

export class HttpRegistration extends HttpBase<{ id: string }> {
  constructor(request: Request) {
    super(request);
  }

  async validate<RequestData>(body: RequestData): Promise<RequestData> {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      displayName: Joi.string().required(),
      languages: Joi.array()
        .items(Joi.string().valid(...Object.keys(Language)))
        .min(1),
      callbackUri: Joi.string().optional(),
      password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(body, { allowUnknown: false });
    if (error) {
      throw new UnprocessableEntityError('input validation error', error);
    }
    return body;
  }

  public async getResponseData(): Promise<{ id: string }> {
    const body: RequestData = await this.validate(this.request.body);
    const callbackUri = getModifiedCallBackUri(body, process.env.AUTHENTICATION_ACTIVATION_CALLBACK);
    const user = await createUser(body.email, body.displayName, body.password);
    const emailTriggerData: EmailTrigger = {
      firebaseUserId: user.uid,
      trigger: EmailType.USER_REGISTRATION,
      callbackUri
    };
    const tempAccountData: AccountData = {
      email: body.email,
      displayName: body.displayName,
      languages: body.languages
    };
    await Promise.all([
      HttpBase.objectWriter.writeObject(emailTriggerData, process.env.EMAIL_TRIGGER_BUCKET, `${user.uid}/${v4()}.json`),
      HttpBase.objectWriter.writeObject(tempAccountData, process.env.TEMP_ACCOUNT_DATA_BUCKET, user.uid)
    ]);
    return { id: user.uid };
  }
}
