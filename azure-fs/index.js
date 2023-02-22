const AzureStorage = require('@azure/storage-file-share');
const { ShareDirectoryClient } = require('@azure/storage-file-share');
const { getStorageInfo } = require('../config');
const path = require('path');

const init = async () => {
  const storageInfo = getStorageInfo();

  // Use StorageSharedKeyCredential with storage account and account key
  // StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
  const sharedKeyCredential = new AzureStorage.StorageSharedKeyCredential(storageInfo.account, storageInfo.accountKey);

  const serviceClient = new AzureStorage.ShareServiceClient(
    // When using AnonymousCredential, following url should include a valid SAS
    `https://${storageInfo.account}.file.core.windows.net`,
    sharedKeyCredential
  );

  // Create a share
  const shareName = 'test-storage';
  const shareClient = serviceClient.getShareClient(shareName);
  try {
    await shareClient.createIfNotExists();
    console.log(`Created share ${shareName} successfully.`);
  } catch (err) {
    console.error(`Cannot create share ${shareName}`);
    console.error(err);
    return undefined;
  }

  // Create a directory
  const directoryName = 'files';
  const directoryClient = shareClient.getDirectoryClient(directoryName);
  try {
    await directoryClient.createIfNotExists();
    console.log(`Created directory ${directoryName} successfully.`);
  } catch (err) {
    console.error(`Cannot create directory ${directoryName}`);
    console.error(err);
    return undefined;
  }

  return directoryClient;
}

/**
 * Creates a file in the specified directory
 * 
 * @param {AzureStorage.ShareDirectoryClient} directoryClient 
 * @param {string} file The path of the file whose contents will be set to the Azure file.
 * @return {Promise<AzureStorage.ShareFileClient>} A promise that will be resolved to the file client for the
 * Azure file.
 */
const createFile = async (directoryClient, file) => {
  const fileClient = directoryClient.getFileClient(path.basename(file));
  await fileClient.uploadFile(file);
  console.log(`Created file ${fileClient.name} successfully.`);
  return fileClient;
}

module.exports = {
  init,
  createFile,
};
