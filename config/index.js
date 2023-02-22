const conn = require('./connection');
const keyVault = require('./keyvault');
const storage = require('./storage');

module.exports = { ...conn, ...keyVault, ...storage };
