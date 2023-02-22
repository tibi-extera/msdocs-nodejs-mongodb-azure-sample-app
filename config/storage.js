require("dotenv").config();

const getStorageInfo = () => {
  return {
    tempStorage: process.env.TEMP_STORAGE,
    account: process.env.STORAGE_ACCOUNT,
    key: process.env.STORAGE_ACCOUNT_KEY,
  };
}

module.exports = { getStorageInfo };