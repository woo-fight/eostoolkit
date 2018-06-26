import config from '../../services/config'
class LotteryData {
  constructor() {
    this.gamerecords = null;
    this.bettingsrecords = null;
    this.curr_game_info = null;
  }

  async load(lottery) {
    let response = { data: {}, errmsg: '' };
    response = await lottery.getGameRecord(config.contract_account);
    // rows.sort(function(a, b) { return b.high_bid - a.high_bid; })
    // res.json({size: rows.length, data: rows.slice(0, 5)});
    this.gamerecords = response.data;;
    this.curr_game_info = response.data[this.gamerecords.length - 1];
    console.log(this.curr_game_info);
    response = await lottery.getBettingsRecord(config.contract_account);
    this.bettingsrecords = response.data;

    console.log(`betperson:${this.curr_game_info.current_index},period:${this.curr_game_info.g_id}`)
  }

  getBettingsByperiod(period) {
    return this.bettingsrecords.filter((betting) => {
      return (betting.g_id === period);
    });
  }
}

let _exports;
export default (() => {
  if (!_exports) {
    _exports = new LotteryData();
  }
  return _exports;
})()