import { IWriteOptions } from 'gcp-object-storage';
import { Options } from 'nodemailer/lib/mailer';
import * as SMTPPool from 'nodemailer/lib/smtp-pool';
import { v4 } from 'uuid';

export class Container {
  private static container: Container;

  public static new() {
    Container.container = new Container();
  }

  public static get(): Container {
    return Container.container;
  }

  private bucketData: StorageData = {};
  private createdFirebaseUsers: FirebaseUser[] = [];
  private rememberedFile: RememberedFile;
  private authenticatedUser: FirebaseUser;
  private mailOptions: SMTPPool.Options;
  private sentMail: Mail;
  private lastGivenFile: RememberedFile;
  private rememberedFirebaseUserId: string;
  private pubSubData: PubSubData = {};

  private readonly functionRequest: FunctionRequest = {
    method: undefined,
    headers: {},
    body: {},
    rawBody: '',
    ip: '',
    ips: [],
    get: (header: string) => {
      return this.functionRequest.headers[header];
    }
  };

  private functionResponse: FunctionResponse = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status: (statusCode: number) => {
      this.functionResponse.statusCode = statusCode;
      return this.functionResponse;
    },
    send: (data: any) => {
      this.functionResponse.body = data;
      return this.functionResponse;
    },
    json: (data: any) => {
      this.functionResponse.body = data;
      return this.functionResponse;
    },
    set: (header: string, value: string) => {
      this.functionResponse.headers[header] = value;
      this.functionResponse.headers[header.toLowerCase()] = value;
    },
    get: (header: string) => {
      return this.functionResponse.headers[header];
    }
  };

  public getBucketData(): StorageData {
    return this.bucketData;
  }

  public addBucketData(bucket: string, filename: string, data: any, options?: IWriteOptions, isNewFile = true) {
    if (!this.bucketData[bucket]) {
      this.bucketData[bucket] = {};
    }
    this.bucketData[bucket][filename] = { __test_newlyWritten: isNewFile, __test_options: options, data };
  }

  public setBucketData(buckets: StorageData): void {
    this.bucketData = buckets;
  }

  public getFunctionRequest(): FunctionRequest {
    return this.functionRequest;
  }

  public getFunctionResponse(): FunctionResponse {
    return this.functionResponse;
  }

  public setFunctionResponse(resp: FunctionResponse) {
    this.functionResponse = resp;
  }

  public getCreatedFirebaseUsers(): FirebaseUser[] {
    return this.createdFirebaseUsers;
  }

  public addCreatedFirebaseUser(user: FirebaseUser): void {
    this.createdFirebaseUsers.push(user);
    this.rememberedFirebaseUserId = user.uid;
  }

  public setCreatedFirebaseUsers(users: FirebaseUser[]): void {
    this.createdFirebaseUsers = users;
  }

  public getRememberedFile(): RememberedFile {
    return this.rememberedFile;
  }

  public setRememberedFile(file: RememberedFile): void {
    this.rememberedFile = file;
  }

  public setAuthenticatedUser(user: FirebaseUser): void {
    this.authenticatedUser = user;
  }

  public getAuthenticatedUser(): FirebaseUser {
    return this.authenticatedUser;
  }

  public setMailOptions(options: SMTPPool.Options): void {
    this.mailOptions = options;
  }

  public getMailOptions(): SMTPPool.Options {
    return this.mailOptions;
  }

  public setSentMail(mail: Mail): void {
    this.sentMail = mail;
  }

  public getSentMail(): Mail {
    return this.sentMail;
  }

  public setLastGivenFile(file: RememberedFile): void {
    this.lastGivenFile = file;
  }

  public getLastGivenFile(): RememberedFile {
    return this.lastGivenFile;
  }

  public getRememberedFirebaseUserId(): string {
    return this.rememberedFirebaseUserId;
  }

  public addPubSubData(topic: string, data: string): void {
    if (!this.pubSubData[topic]) {
      this.pubSubData[topic] = [];
    }
    this.pubSubData[topic].push(data);
  }

  public getPubSubData(): PubSubData {
    return this.pubSubData;
  }
}

interface FunctionRequest {
  method?: string;
  headers?: object;
  body?: object;
  rawBody?: string;
  query?: object;
  ip?: string;
  ips?: string[];

  get(header: string): any;
}

interface FunctionResponse {
  statusCode: number;
  body: object;
  headers: object;

  status(statusCode: number): FunctionResponse;
  send(data: any): FunctionResponse;
  json(data: any): FunctionResponse;
  set(header: string, value: string): void;
  get(header: string): any;
}

export interface FirebaseUser {
  uid?: string;
  email?: string;
  password?: string;
  displayName?: string;
  emailVerified?: boolean;
  customClaims?: { [key: string]: string | boolean };
}

interface StorageData {
  [key: string]: {
    [key: string]: WrittenData;
  };
}

export interface WrittenData {
  __test_newlyWritten: boolean;
  __test_options?: IWriteOptions;
  data: any;
}

interface RememberedFile {
  fileName: string;
  value: WrittenData;
}

interface Mail {
  to: string;
  body: string;
  attachments: Array<{ filename: string; content: Buffer | string }>;
  replyTo: string;
}

interface PubSubData {
  [key: string]: Array<string>;
}
