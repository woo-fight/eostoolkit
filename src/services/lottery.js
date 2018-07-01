import ScatterService from 'scatter-client'
import config from './config.js'
class Lottery {
  constructor() {
  }
  async joinGame(game_index) {
    const response = { data: {}, errmsg: '' };
    const auth = ScatterService.getAuthorization()
    const contract = await ScatterService.getContract();

    const join_game = await contract.join(auth.account.name, game_index, auth.permission)
      .catch(e => {
        console.error('failed to join the game  ', e)
        const errorObj = JSON.parse(e)
        const errorMsg = (e && e.message) ||
          (errorObj && errorObj.error && errorObj.error.details && errorObj.error.details.length && errorObj.error.details[0].message) ||
          'An error happened while creating the monster'
        response.errmsg = errorMsg;
      })

    if (join_game) { response.data = { transaction_id: join_game.transaction_id } };

    return response;
  }
  async getGameRecord(account) {
    const response = { data: {}, errmsg: '' };
    const localNet = ScatterService.getEos();
    const games_info = await localNet.getTableRows({
      "json": true,
      "scope": account,
      "code": config.contract_account,
      "table": 'lotterygame',
      "limit": 1000000
    }).then(res => {
      if (res && res.rows && res.rows.length) {
        return res.rows;
      } else {
        return [];
      }
    }).catch(e => {
      console.log(e);
      return null;
    })

    if (games_info) {
      response.data = games_info;
    }
    else {
      response.errmsg = 'Error while getting games info';
    }
    return response;
  }
  async getBettingsRecord(account) {
    const response = { data: {}, errmsg: '' };
    const localNet = ScatterService.getEos();
    const bettings_info = await localNet.getTableRows({
      "json": true,
      "scope": account,
      "code": config.contract_account,
      "table": 'betting',
      "limit": 1000000
    }).then(res => {
      if (res && res.rows && res.rows.length) {
        return res.rows;
      } else {
        return [];
      }
    }).catch(e => {
      console.log(e);
      return null;
    })

    if (bettings_info) {
      response.data = bettings_info;
    }
    else {
      response.errmsg = 'Error while getting games info';
    }

    return response;
  }
  async transfer2lottery(betAmount) {
    const response = { data: {}, errmsg: '' };
    const auth = ScatterService.getAuthorization()

    console.log("bet " + betAmount)

    const data = {
      from: auth.account.name,
      to: config.contract_account,
      quantity: betAmount.toFixed(4) + ' ' + config.token_symnol,
      memo: 'bet'
    }

    // const options = {
    //   broadcast: true,
    //   authorization: auth.permission.authorization
    // }

    const contract = await ScatterService.getEos().contract('eosio.token')
      .catch(e => {
        console.error('fail to initialize eosio.token ', e)
        app.ports.depositFailed.send('Fail to Initialize eosio.token')
      })
    if (!contract) return
    const transfer = await contract.transfer(data, auth.permission)
      .catch(e => {
        console.error('error on bet transfer ', e)
        const errorMsg = (e && e.message) ||
          'An error happened while making the bet, please try again'
        response.errmsg = errorMsg;
      })

    if (transfer) (response.data = { transaction_id: transfer.transaction_id });
    return response;
  }
}

let _exports;
export default (() => {
  if (!_exports) {
    _exports = new Lottery();
  }
  return _exports;
})()

// transfertolottery(accoutName, contract, game_index) {
  //   eos.transaction(
  //     {
  //       // ...headers,
  //       actions: [
  //         {
  //           account: 'eosio.token',
  //           name: 'transfer',
  //           authorization: [{
  //             actor: 'inita',
  //             permission: 'active'
  //           }],
  //           data: {
  //             from: 'inita',
  //             to: 'initb',
  //             quantity: '7.0000 SYS',
  //             memo: ''
  //           }
  //         }
  //       ]
  //     }
  //     // options -- example: {broadcast: false}
  //   )
  // }