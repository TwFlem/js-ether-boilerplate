const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { CampaignFactory: { interface, bytecode} } = require('./build');
require('dotenv').config();

const provider = new HDWalletProvider(
  process.env.MNUEMONIC,

  `${process.env.NODE_URL_BASE}/${process.env.NODE_URL_KEY}`
);

const web3 = new Web3(provider);

let accounts;
let factory;
let factoryManagerAddress;

const deploy = async () => {
  accounts = await web3.eth.getAccounts();
  factoryManagerAddress = accounts[0];
  factory = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
  console.log('manager address', factoryManagerAddress);
  console.log('factory address', factory);
};
deploy();
