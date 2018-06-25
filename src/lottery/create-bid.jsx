import React from 'react'
import update from 'react-addons-update';
import {Grid, Row, Col, Panel, Label, Form, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Button, ProgressBar, Alert, Table, Popover, OverlayTrigger } from 'react-bootstrap';
import { EosClient, bindNameToState } from '../scatter-client.jsx';
import NumericInput from 'react-numeric-input';
import Lottery from '../services/lottery.js'
import lotterydata from './js/lotterydata.js'

import config from 'config'
import ScatterService from '../services/scatter-client.js'

export default class CreateBid extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleBidder = this.handleBidder.bind(this);
    this.handleGameID = this.handleGameID.bind(this);
    this.handleGameBets = this.handleGameBets.bind(this);


    this.state = {
      // gamerecords,
      // bettingrecords,
      loading: false,
      error: false,
      success: '',
      reason: '',
      gameid: '',
      gamebets: 1,
      bidder: '',
      name: '',
      bid: 0.1,
      transaction_id: '',
      betperson: '',
      period: 'N',
      max_player: '',
      eos: null
    };

    document.addEventListener('scatterLoaded', async (scatterExtension) => {
      console.log('Scatter connected @@@@@@@@@@@@@@')

      setInterval(() => {
        bindNameToState(this.setState.bind(this), ['bidder']);
      }, 1000);

      // let response = {};
      // response = await Lottery.getGameRecord(this.state.bidder);
      // console.log(response);
      // console.log(response.data)
      await lotterydata.load(Lottery, this.state.bidder);

      /* 投注期数 */
      setInterval(() => {
        this.setState({ period: lotterydata.curr_game_info.g_id });
      }, 1000);
      
      /* 投注人数 */
      setInterval(() => {
        this.setState({ betperson: lotterydata.curr_game_info.current_index});
      }, 1000);

      /* 投注最大人数 */
      this.setState({ max_player: lotterydata.curr_game_info.max_player });
      console.log (this.state.max_player);
    });
  }

  async  componentDidMount() {
    // this.load(window.scatter, config.customNetwork);
    console.log(window.scatter, '&&&&&&&&&&&&&^^^');
    console.log('componentDidMount createbid');
    if (window.scatter !== undefined) {
      this.setState({ eos: EosClient() });
      bindNameToState(this.setState.bind(this), ['bidder']);
    }
  }

  handleBidder(e) {
    this.setState({ bidder: e.target.value });
  }

  handleGameID(e) {
    this.setState({ gameid: e.target.value });
  }

  handleGameBets(n) {
    this.setState({ gamebets: n });
  }

  async createlottery(e) {
    e.preventDefault();
    this.setState({ loading: true, error: false, reason: '' });

    let response = {};
    console.log('&&&&&&&&&&&', this.state.period);
    console.log(this.state.gamebets);
    
    // response = await Lottery.joinGame(this.state.period - 1);
    response = await Lottery.transfer2lottery(this.state.gamebets);
    console.log('bet response', response);
    if (response.errmsg == '') {
      this.setState({ success: true });
      this.setState({ loading: false, error: false });
      console.log('success');
      this.setState({ transaction_id: response.data.transaction_id })
    } else {
      this.setState({ success: false });
      this.setState({ loading: false, error: true });
      console.log('failed');
    }
    await lotterydata.load(Lottery, this.state.bidder);
  }

  render() {
    const isError = this.state.error;
    const isLoading = this.state.loading;
    const isSuccess = this.state.success;
    const txid = this.state.transaction_id;

    const RenderStatus = () => {
      if (isError) {
        return (
          <Alert bsStyle="warning">
            <strong>投注数量:{this.state.gamebets} 投注结果:失败 {this.state.reason}</strong>
          </Alert>
        );
      }

      if (isLoading) {
        return (<ProgressBar active now={100} label='正在投注' />);
      }

      if (isSuccess !== '') {
        return (
          <Alert bsStyle="success">
            <strong>投注数量:{this.state.gamebets}  投注结果:成功.交易ID: <a href={"https://eospark.com/MainNet/tx/" + txid} target="new">{this.state.transaction_id}</a></strong>
          </Alert>
        );
      }
      return ('');
    }

    return (
      <div>
        <h3>
          <Label bsStyle="success">第{this.state.period}期</Label>
        </h3>
        <br />
        <h5>投注进度(满{this.state.max_player}人开奖)</h5><ProgressBar active bsStyle="info" now={this.state.betperson * 100 / this.state.max_player} label={this.state.betperson+"/"+this.state.max_player} />
        <Form style={{ paddingTop: '1em' }}>
          <FormGroup>
            <ControlLabel>投注账号</ControlLabel>{' '}
            <FormControl
              type="text"
              value={this.state.bidder}
              placeholder="Account Name - Linked to Scatter"
              onChange={this.handleBidder}
              disabled
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>投注数量(每注0.1EOS)</ControlLabel>{' '}
            <NumericInput
              mobile
              value={this.state.gamebets}
              className="form-control"
              placeholder="投注数量"
              onChange={this.handleGameBets}
              min={1} max={100} step={1} />
          </FormGroup>{' '}
          <Button type="submit" onClick={this.createlottery.bind(this)}>投注</Button>
        </Form>
        <div style={{ paddingTop: '2em' }}>
          <RenderStatus />
        </div>
      </div>
    );
  }
}
module.hot.accept();
