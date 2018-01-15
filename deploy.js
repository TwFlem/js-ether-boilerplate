const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');
require('dotenv').config();

const provider = new HDWalletProvider(
  process.env.MNUEMONIC,
  `${process.env.NODE_URL_BASE}/${process.env.NODE_URL_KEY}`
);

const web3 = new Web3(provider);

let accounts;
let inbox;
const defaultMessage = 'hello world!';

const deploy = async () => {
  accounts = await web3.eth.getAccounts();
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: [defaultMessage] })
    .send({ from: accounts[0], gas: '1000000' });

  console.log(inbox);
};

deploy();