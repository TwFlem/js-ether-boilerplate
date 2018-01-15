const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface, bytecode } = require('../compile');

const provider = ganache.provider();
const web3 = new Web3(provider);

let accounts;
let inbox;
const defaultMessage = 'hello world!';
const newMessage = 'goodbye world!';

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: [defaultMessage] })
    .send({ from: accounts[0], gas: '1000000' });
  inbox.setProvider(provider);
});

describe('Inbox', () => {
  it('deploys a contract', () => {
    assert.ok(inbox.options.address);
  });
  it('deployed contract has a default message', async () => {
    assert.equal(await inbox.methods.message().call(), defaultMessage);
  });
  it('deployed contract can set message', async () => {
    await inbox.methods.setMessage(newMessage).send({ from: accounts[0], gas: '1000000'});
    assert.equal(await inbox.methods.message().call(), newMessage);
  });
});