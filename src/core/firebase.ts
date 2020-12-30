import * as admin from 'firebase-admin';
import * as querystring from 'querystring';
import { ConflictError } from './error/conflict.error';
import ActionCodeSettings = admin.auth.ActionCodeSettings;

let initialized = false;

export function initializeFirebase(): void {
  if (!initialized) {
    admin.initializeApp();
  }
  initialized = true;
}

export async function createUser(email: string, displayName: string, password: string): Promise<admin.auth.UserRecord> {
  try {
    initializeFirebase();
    return await admin.auth().createUser({
      email,
      password: password,
      displayName,
      emailVerified: false
    });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      throw new ConflictError();
    }
    throw err;
  }
}

export function getUser(uid: string): Promise<admin.auth.UserRecord> {
  initializeFirebase();
  return admin.auth().getUser(uid);
}

export function getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
  initializeFirebase();
  return admin.auth().getUserByEmail(email);
}

export async function getActivationLink(email: string, callbackUri: string): Promise<string> {
  initializeFirebase();
  const actionCodeSettings: ActionCodeSettings = {
    url: callbackUri,
    // This must be true.
    handleCodeInApp: true
  };
  const link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
  const oobCode = link.split('oobCode=')[1].split('&')[0];
  return `${callbackUri}?${querystring.stringify({ oobCode })}`;
}

export async function getPasswordResetLink(email: string, callbackUri: string): Promise<string> {
  initializeFirebase();
  const actionCodeSettings: ActionCodeSettings = {
    url: callbackUri,
    // This must be true.
    handleCodeInApp: true
  };
  const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
  const oobCode = link.split('oobCode=')[1].split('&')[0];
  return `${callbackUri}?${querystring.stringify({ oobCode })}`;
}

export async function listAllUserIds(pageToken?: string): Promise<Array<string>> {
  initializeFirebase();
  const result = await admin.auth().listUsers(1000, pageToken);
  const userIds = result.users.map((user: admin.auth.UserRecord) => user.uid);
  if (result.pageToken) {
    return [...userIds, ...(await listAllUserIds(result.pageToken))];
  }
  return userIds;
}
