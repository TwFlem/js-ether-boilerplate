const path = require('path');
const fs = require('fs');
const solc = require('solc');

const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');
const src = fs.readFileSync(inboxPath, 'utf8');

module.exports = solc.compile(src, 1).contracts[':Inbox'];