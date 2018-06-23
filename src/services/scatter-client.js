import Eos from 'eosjs'
import config from 'config.js'
const mainNetwork = {
  blockchain: 'eos',
  host: 'mainnet.genereos.io', // ( or null if endorsed chainId )
  port: 443, // ( or null if defaulting to 80 )
  chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906", // Or null to fetch automatically ( takes longer )
}

class ScatterService {
  constructor() {
    this.network = mainNetwork;
    this.scatter = window.scatter;
  }

  load() {
    this.scatter = window.scatter;
    if (this.identity) {
      this.scatter.useIdentity(this.scatter.identity.hash);
    }

    this.eos = this.scatter.eos(this.network, Eos, {}, config.environment.eosProtocol);
  }
  login(network) {
    this.network = network || this.network;
    const requirements = { accounts: [this.network] };
    this.scatter.getIdentity(requirements).then(() => {
      console.log('Attach Identity');
      console.log(window.scatter.identity);
    }).catch(error => {
      console.error(error);
    });
  }

  logout() {
    this.scatter.forgetIdentity().then(() => {
      console.log('Detach Identity');
      console.log(this.scatter.identity);
    }).catch((e) => {
      if (e.code == 423) {
        console.log('No identity to detach');
      }
    });
  }
  getAuthorization() {
    if (!this.scatter || !this.scatter.identity || !this.scatter.identity.accounts)
      return null;

    const account = this.scatter.identity.accounts.find(account => account.blockchain === 'eos')

    return {
      permission: {
        authorization: [`${account.name}@${account.authority}`]
      },
      account
    }
  }
  getEos() {
    return this.scatter.eos(this.network, Eos, { chainId: this.network.chainId });
  }
  async getContract() {
    return getEos().contract(config.contract_account);
  }
  async getAccount() {
    const user = {
      eosAccount: this.scatter.identity.accounts[0].name,
      publicKey: this.scatter.identity.publicKey
    }
  }
}

export default ScatterService;