const contracts = require('../build/index');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
const assert = require('assert');

const cf = contracts.CampaignFactory;
const c = contracts.Campaign;
let accounts;
let factory;
let campaignAddress;
let campaign;
let manager0;
let manager1;
let manager2;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  manager0 = accounts[0];
  manager1 = accounts[1];
  manager2 = accounts[2];

  factory = await new web3.eth.Contract(JSON.parse(cf.interface))
    .deploy({ data: cf.bytecode })
    .send({ from: manager0, gas: '1000000' });
  factory.setProvider(provider);

  await factory.methods.createCampaign('100').send({
    from: manager0,
    gas: '1000000'
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
  campaign = await new web3.eth.Contract(JSON.parse(c.interface), campaignAddress);
  campaign.setProvider(provider);
});

describe('Campaign Boilerplate', () => {
  it('Factory Deployed', () => {
    assert(factory)
  });
  it('Campaign Deployed', () => {
    assert(campaign);
  });
  it('Factory holds several campaign addresses', async () => {
    await factory.methods.createCampaign('100').send({
      from: manager0,
      gas: '1000000'
    });
    const campaignAddresses = await factory.methods.getDeployedCampaigns().call();
    assert(campaignAddresses.length === 2);
  });
  it('Factories in Campaings have specific managers', async () => {
    await factory.methods.createCampaign('100').send({
      from: manager1,
      gas: '1000000'
    });
    await factory.methods.createCampaign('100').send({
      from: manager2,
      gas: '1000000'
    });

    const [campAdd0, campAdd1, campAdd2] = await factory.methods.getDeployedCampaigns().call();
    const campaign0 = await new web3.eth.Contract(JSON.parse(c.interface), campAdd0);
    const campaign1 = await new web3.eth.Contract(JSON.parse(c.interface), campAdd1);
    const campaign2 = await new web3.eth.Contract(JSON.parse(c.interface), campAdd2);
    campaign.setProvider(campaign0);
    campaign.setProvider(campaign1);
    campaign.setProvider(campaign2);

    assert.equal(manager0, await campaign0.methods.manager().call());
    assert.equal(manager1, await campaign1.methods.manager().call());
    assert.equal(manager2, await campaign2.methods.manager().call());
  });
  it('user contributes and becomes contributor', async () => {
    await campaign.methods.contribute().send({
      from: manager1,
      value: '200',
      gas: '1000000'
    });
    assert.ok(campaign.methods.contributors(manager1).call());
  });
  it('user contributes and fails to provide minimum value of 100', async () => {
    try {
      await campaign.methods.contribute().send({
        from: manager1,
        value: '99',
        gas: '1000000'
      });
    } catch(err) {
      assert(err);
      return;
    }
    assert(false);
  });
  it('Manager makes payment request', async () => {
    await campaign.methods.makeReq('Need parts', '100', manager1)
      .send({
        from: manager0,
        gas: '1000000'
      });
    assert(await campaign.methods.requests(0))
  });
  it('Non-Managers cannot make payment request', async () => {
    try {
      await campaign.methods.makeReq('Need parts', '100', manager1)
        .send({
          from: manager2,
          gas: '1000000'
        });
    } catch(err) {
      assert(err);
      return;
    }
    assert(false);
  });
  it('finalizes a request and vendor receives ether', async () => {
    await campaign.methods.contribute().send({
      from: manager2,
      value: (web3.utils.toWei('10', 'ether'))
    });

    await campaign.methods
      .makeReq('Req A', web3.utils.toWei('5', 'ether'), manager1)
      .send({ from: manager0, gas: '1000000' });

    await campaign.methods.approveReq(0).send({
      from: manager2,
      gas: '1000000'
    });

    await campaign.methods.finalizeReq(0).send({
      from: manager0,
      gas: '1000000'
    });

    assert.ok(parseFloat(web3.utils.fromWei(await web3.eth.getBalance(manager1), 'ether')) > 104);
  });
});