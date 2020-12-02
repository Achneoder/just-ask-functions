import { IWriteOptions } from 'gcp-object-storage';
import * as storageHandler from 'gcp-object-storage';
import * as pubSub from '@google-cloud/pubsub';
import { decode } from 'jsonwebtoken';
import * as stream from 'stream';
import { Container, FirebaseUser } from './container';
import * as _ from 'lodash';
import * as nodeMailer from 'nodemailer';
import * as SMTPPool from 'nodemailer/lib/smtp-pool';

let userCreateId = undefined;

export function mockMailer() {
  //@ts-ignore
  nodeMailer.createTransport = jest.fn((options: SMTPPool.Options) => {
    Container.get().setMailOptions(options);
    return {
      sendMail: jest.fn((mailData: { from: string; to: string; subject: string; html: string }) => {
        Container.get().setSentMail({
          body: mailData.html,
          to: mailData.to,
          attachments: undefined,
          replyTo: undefined
        });
        return Promise.resolve();
      })
    };
  });
}

export function setUserCreateId(id: string) {
  userCreateId = id;
}

export const storageInstanceMock = {
  bucket: (bucketName: string) => ({
    getFiles: (options) => {
      const bucketData = Container.get().getBucketData();
      const folder = options.prefix;
      const objects = Object.keys(bucketData[bucketName])
        .filter((fileName) => (folder ? fileName.startsWith(folder) : true))
        .map((fileName) => ({
          name: fileName,
          getMetadata: () => Promise.resolve(bucketData[bucketName][fileName].__test_options?.metadata || {}),
          metadata: bucketData[bucketName][fileName].__test_options?.metadata || {}
        }));
      return Promise.resolve([objects]);
    },
    file: (fileName: string) => ({
      download: () => {
        if (!Container.get().getBucketData()[bucketName] || !Container.get().getBucketData()[bucketName][fileName]) {
          return Promise.reject(new Error('no bucket or file found'));
        }
        return Promise.resolve([Container.get().getBucketData()[bucketName][fileName]['data']]);
      },
      get: () => {
        const buckets = Container.get().getBucketData();
        if (buckets[bucketName] && buckets[bucketName][fileName]) {
          const file = buckets[bucketName][fileName];
          return Promise.resolve([{ metadata: file.__test_options?.metadata || {} }]);
        } else {
          throw Promise.reject(new Error('file not found'));
        }
      },
      setMetadata: (newMetadata) => {
        const buckets = Container.get().getBucketData();

        if (buckets[bucketName] && buckets[bucketName][fileName]) {
          const file = buckets[bucketName][fileName];
          const fileMetadata = file.__test_options?.metadata || {};

          // todo: need to verify if old custom metadat will be overwritten
          // fileMetadata.metadata is cutom metadata
          fileMetadata.metadata = { ...fileMetadata.metadata, ...newMetadata.metadata };
          buckets[bucketName][fileName].__test_options = { metadata: fileMetadata };

          return Promise.resolve([fileMetadata.metadata]);
        } else {
          return Promise.reject(Error('file not found'));
        }
      },
      createWriteStream: () => {
        return new stream.Writable({
          write(chunk: Buffer, encoding, callback) {
            Container.get().addBucketData(bucketName, fileName, chunk);
            callback();
          },
          writev(chunks, callback) {
            callback();
          }
        });
      },
      createReadStream: () => {
        return undefined;
      }
    })
  })
};

/**
 * Initiate mock of storage related functions.
 */
export function mockStorage() {
  // @ts-ignore
  storageHandler.ObjectReader = jest.fn(() => ({
    readObject: jest.fn((bucketname: string, filename: string) => {
      const bucketData = Container.get().getBucketData();
      if (!bucketData[bucketname] || !bucketData[bucketname][filename]) {
        return Promise.reject(new Error('no data'));
      }
      try {
        // Make sure you added files via Container.get().addBucketData()
        const data = JSON.parse(JSON.stringify(bucketData[bucketname][filename]['data']));
        return Promise.resolve(data);
      } catch (err) {
        return Promise.reject(err);
      }
    })
  }));

  // @ts-ignore
  storageHandler.ObjectWriter = jest.fn(() => ({
    writeObject: jest.fn((data: any, bucketname: string, filename: string, options?: IWriteOptions) => {
      filename = filename.endsWith('.json') ? filename : filename + '.json';
      Container.get().addBucketData(bucketname, filename, data, options);
    }),
    deleteObject: jest.fn((bucket: string, filename: string) => {
      const bucketData = Container.get().getBucketData();
      delete bucketData[bucket][filename];
      Container.get().setBucketData(bucketData);
      return Promise.resolve();
    })
  }));
}

export const pubSubMock = () => ({
  PubSub: jest.fn(() => ({
    topic: jest.fn((targetTopic: string) => {
      return {
        publishJSON: jest.fn((data: any) => {
          const message = Buffer.from(JSON.stringify(data), 'utf8').toString('base64');
          Container.get().addPubSubData(targetTopic, message);
          return Promise.resolve(message);
        })
      };
    })
  }))
})

export const verifyIdTokenMock = (token) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(decode(token));
    } catch (err) {
      reject('failed');
    }
  });
};

export const updateUserMock = (id: any, data: FirebaseUser) => {
  const container = Container.get();
  const user = Container.get()
    .getCreatedFirebaseUsers()
    .find((u) => u.uid === id);
  if (user) {
    user.displayName = data.displayName || user.displayName;
    user.email = data.email || user.email;
  }
  if (container.getAuthenticatedUser().uid === id) {
    container.setAuthenticatedUser({ ...container.getAuthenticatedUser(), ...data });
  }
  return Promise.resolve(user);
};

export const createUserMock = (user: FirebaseUser) => {
  const container = Container.get();
  if (container.getCreatedFirebaseUsers().find((existingUser) => existingUser.email === user.email)) {
    const err = new Error('user already exists');
    err['code'] = 'auth/email-already-exists';
    return Promise.reject(err);
  }
  if (userCreateId) {
    container.addCreatedFirebaseUser({ ...user, uid: userCreateId });
  } else {
    container.addCreatedFirebaseUser(user);
  }
  return Promise.resolve({ ...user, uid: '0bxPDKQCVaQ2JMKJCDmIaEocWdA2', disabled: false });
};

export const getUserByEmailMock = (email: string) => {
  const firebaseUser = Container.get()
    .getCreatedFirebaseUsers()
    .find((user) => user.email === email);
  if (firebaseUser) {
    return Promise.resolve(firebaseUser);
  }
  return Promise.reject(new Error('user not found'));
};

export const generateEmailVerificationLinkMock = (email, settings) => {
  return 'https://somelinkto.me?oobCode=123456&somequery=abc';
};

export const generatePasswordResetLinkMock = (email, settings) => {
  return 'https://somelinkto.me?oobCode=123456&somequery=abc';
};

export const getUserMock = (uid: string) => {
  const user = Container.get()
    .getCreatedFirebaseUsers()
    .find((user) => user.uid === uid);
  return user ? Promise.resolve(user) : Promise.reject(new Error('User not found'));
};

export const listUsersMock = (maxResults?: number, pageToken?: string) => {
  maxResults = maxResults ? maxResults : 1000;
  const pageMultiplier = Number(pageToken) + 1;
  const users = Container.get().getCreatedFirebaseUsers();
  const returnPageToken = users.length > maxResults * pageMultiplier ? pageMultiplier.toString() : undefined;
  const returnUsers = users.slice(maxResults * pageMultiplier, maxResults);
  return Promise.resolve({ users: returnUsers, pageToken: returnPageToken });
};

export const setCustomUserClaimsMock = (uid: string, claims: { [key: string]: string }) => {
  const container = Container.get();
  let updated = false;
  let user = container.getCreatedFirebaseUsers().find((user) => user.uid === uid);
  if (container.getAuthenticatedUser()?.uid === uid) {
    container.getAuthenticatedUser().customClaims = claims;
    updated = true;
  }
  if (user) {
    user.customClaims = claims;
    updated = true;
  }
  if (updated) {
    return Promise.resolve();
  }
  return Promise.reject(new Error('User not found'));
};

export const deleteUserMock = (uid: string) => {
  Container.get().setCreatedFirebaseUsers(
    Container.get()
      .getCreatedFirebaseUsers()
      .filter((user) => user.uid !== uid)
  );
  return Promise.resolve();
};
