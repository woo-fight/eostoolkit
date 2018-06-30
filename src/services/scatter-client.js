import Eos from 'eosjs'
import config from 'config'

class ScatterService {
  constructor() {
    this.network = '';;
    this.scatter = undefined;
    this.eos = undefined;
    document.addEventListener('scatterLoaded', scatterExtension => {
      console.log('ScatterService init');
      window.scatter.suggestNetwork(config.customNetwork);
      this.load(window.scatter, config.customNetwork);
    })
  }

  async load(scatter, network) {
    this.scatter = scatter;
    // console.log(this.identity, this.scatter.identity.hash);
    // if (this.identity) {
    // this.scatter.useIdentity(this.scatter.identity.hash);
    // }
    this.network = network;
    this.eos = this.scatter.eos(this.network, Eos, {
      broadcast: true,
      sign: true,
      chainId: this.network.chainId
    }, config.environment.eosProtocol);
  }
  login(network) {
    console.log('login:', this.scatter, '   network', network);
    if (!this.scatter)
      return null;
    this.network = network || this.network;
    console.log('network:', this.network);
    const requirements = { accounts: [this.network] };
    return this.scatter.getIdentity(requirements).then(() => {
      console.log('Attach Identity');
      console.log(window.scatter.identity);
      this.load(this.scatter, this.network);
    });
  }

  logout() {
    if (!this.scatter)
      return null;
    return this.scatter.forgetIdentity().then(() => {
      console.log('Detach Identity');
      console.log(this.scatter.identity);
    });
  }
  getAuthorization() {
    console.log('func getAuthorization', this.scatter);
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
    console.log('func getEos', this.eos);
    if (this.eos) return this.eos;
    // return this.scatter.eos(this.network, Eos, {
    //   broadcast: true,
    //   sign: true,
    //   chainId: this.network.chainId
    // });
  }
  getContract() {
    console.log('func getContract', this.scatter);
    if (!this.scatter)
      return null;
    console.log(this.getEos(), '*******');
    return this.getEos().contract(config.contract_account);
  }
  getAccount() {
    console.log('func getAccount', this.scatter, this.scatter.identity);
    if (!this.scatter)
      return null;
    const account = this.scatter.identity.accounts.find(account => account.blockchain === 'eos')
    return {
      eosAccount: account.name,//this.scatter.identity.accounts[0].name,
      publicKey: this.scatter.identity.publicKey
    }
  }
}
let _exports;
export default (() => {
  if (!_exports) {
    _exports = new ScatterService();
  }
  return _exports;
})()
