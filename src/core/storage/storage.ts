import * as gcStorage from '@google-cloud/storage';
import { File, GetFilesOptions, Storage } from '@google-cloud/storage';

let storage: gcStorage.Storage;

export function getStorage(): Storage {
  if (!storage) {
    storage = new gcStorage.Storage();
  }
  return storage;
}

export async function listFiles(bucket: string, folder?: string, pageToken?: string): Promise<File[]> {
  const options: GetFilesOptions = {};
  if (folder) {
    options.prefix = folder;
  }
  if (pageToken) {
    options.pageToken = pageToken;
  }
  const result = await getStorage().bucket(bucket).getFiles(options);
  const files = result[0];
  if (result[1]['pageToken']) {
    const nextPageFiles = await listFiles(bucket, folder, pageToken);
    files.push(...nextPageFiles);
  }
  return files;
}
