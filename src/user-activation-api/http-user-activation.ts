import { Request } from 'express';
import { v4 } from 'uuid';
import { UnauthorizedError } from '../core/error/unauthorized.error';
import { getUser } from '../core/firebase';
import { HttpBase } from '../core/http';
import { AccountData } from '../core/interfaces/account-data.interface';

export class HttpUserActivation extends HttpBase<void> {
  constructor(request: Request) {
    super(request);
  }

  public async getResponseData(): Promise<void> {
    const userId = await this.getAuthorizeUserId();
    const user = await getUser(userId);
    const isVerified = user.emailVerified;

    if (!isVerified) {
      throw new UnauthorizedError('user has not verified his email-address');
    }

    const accountData = await HttpBase.objectReader.readObject<AccountData>(
      process.env.TEMP_ACCOUNT_DATA_BUCKET,
      `${user.uid}.json`
    );
    await HttpBase.objectWriter.writeObject(accountData, process.env.ACCOUNT_DATA_BUCKET, `${user.uid}/${v4()}.json`);
  }

  protected validate<T>(body: T): Promise<T> {
    return Promise.resolve(body);
  }
}
