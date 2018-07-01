import React from 'react'
import update from 'react-addons-update';
import { Grid, Row, Col, Panel, Label, Form, FormGroup, FormControl, ControlLabel, HelpBlock, ListGroup, ListGroupItem, Button, ProgressBar, Alert, Table, Popover, OverlayTrigger } from 'react-bootstrap';
import { bindNameToState } from '../scatter-client.jsx';
import NumericInput from 'react-numeric-input';
import Lottery from '../services/lottery.js'
import lotterydata from './js/lotterydata.js'
import pay from '../images/pay.jpeg'
export default class Betting extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleBidder = this.handleBidder.bind(this);
    this.handleGameBets = this.handleGameBets.bind(this);


    this.state = {
      loading: false,
      error: false,
      success: '',
      reason: '',
      gamebets: 1,
      bidder: '',
      transaction_id: '',
      betperson: '',
      period: 'N',
      max_player: '',
      eos: null
    };

    document.addEventListener('scatterLoaded', async (scatterExtension) => {
      console.log('Scatter connected')

      setInterval(() => {
        bindNameToState(this.setState.bind(this), ['bidder']);
      }, 1000);

      await lotterydata.load(Lottery);

      /* 投注期数 */
      setInterval(() => {
        if (lotterydata.curr_game_info)
          this.setState({ period: lotterydata.curr_game_info.g_id + 1 });
      }, 1000);

      /* 投注人数 */
      setInterval(() => {
        if (lotterydata.curr_game_info)
          this.setState({ betperson: lotterydata.curr_game_info.current_index });
      }, 1000);

      /* 投注最大人数 */
      if (lotterydata.curr_game_info)
        this.setState({ max_player: lotterydata.curr_game_info.max_player });
    });
  }

  async  componentDidMount() {
    // this.load(window.scatter, config.customNetwork);
    if (window.scatter !== undefined) {
      bindNameToState(this.setState.bind(this), ['bidder']);
    }
  }

  handleBidder(e) {
    this.setState({ bidder: e.target.value });
  }

  handleGameBets(n) {
    this.setState({ gamebets: n });
  }

  async createlottery(e) {
    e.preventDefault();
    this.setState({ loading: true, error: false, reason: '' });

    let response = {};

    response = await Lottery.transfer2lottery(this.state.gamebets * 0.1);
    if (response.errmsg == '') {
      this.setState({ success: true });
      this.setState({ loading: false, error: false });
      this.setState({ transaction_id: response.data.transaction_id })
    } else {
      this.setState({ success: false });
      this.setState({ loading: false, error: true });
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
        <h5>投注进度(满{this.state.max_player}人开奖)</h5><ProgressBar active bsStyle="info" now={this.state.betperson * 100 / this.state.max_player} label={this.state.betperson + "/" + this.state.max_player} />
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
        <img style={{ paddingTop: '2em' }} width="270" height="382" src={pay} alt="" />
        <div style={{ paddingTop: '2em' }}>
          <RenderStatus />
        </div>
      </div>
    );
  }
}
module.hot.accept();
