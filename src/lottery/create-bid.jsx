import React from 'react'
import update from 'react-addons-update';
import { Grid, Row, Col, Panel, Label, Form, FormGroup, FormControl, ControlLabel, HelpBlock,ListGroup,ListGroupItem, Button, ProgressBar, Alert, Table, Popover, OverlayTrigger } from 'react-bootstrap';
import { EosClient, bindNameToState } from '../scatter-client.jsx';
import NumericInput from 'react-numeric-input';
import Lottery from '../services/lottery.js'
import config from 'config'
import ScatterService from '../services/scatter-client.js'

export default class CreateBid extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleBidder = this.handleBidder.bind(this);
    this.handleGameID = this.handleGameID.bind(this);
    this.handleGameBets = this.handleGameBets.bind(this);
    

    this.state = {
      loading: false,
      error: false,
      success: '',
      reason: '',
      gameid: '',
      gamebets: '',
      bidder: '',
      name: '',
      bid: 0.1,
      transaction_id: '',
      betperson: '',
      period:'',
      eos: null
    };

   document.addEventListener('scatterLoaded', scatterExtension => {
      console.log('Scatter connected')

      setInterval(() => {
        bindNameToState(this.setState.bind(this), ['bidder']);
      }, 1000);

      /* 投注期数 */
      let response = {};
      response = Lottery.getGameRecord(this.state.bidder);
      console.log (response);    
      console.log (response.data)

      this.setState({ period: 6 });

      /* 投注人数 */
      setInterval(() => {
        this.setState({ betperson: 6 });
      }, 1000);

    });
  }

  componentDidMount() {
    if(window.scatter !== undefined) {
      this.setState({ eos: EosClient()});
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
    this.setState({loading:true, error:false, reason:''}); 

    let response = {};
    response = await Lottery.joinGame(9);
    console.log (response);

    if (response.errmsg == ''){
      this.setState({success: true});
      this.setState({loading:false, error:false});
      console.log ('success');
      this.setState({transaction_id: response.data.transaction_id})
    } else{
      this.setState({success: false});
      this.setState({loading:false, error:true});
      console.log ('failed');
    }

    console.log('joinGame respone', response);
  }

  render() {
    const isError = this.state.error;
    const isLoading = this.state.loading;
    const isSuccess = this.state.success;
    const txid = this.state.transaction_id;

    const RenderStatus = () => {
      if(isError) {
        return (
          <Alert bsStyle="warning">
            <strong>投注失败. {this.state.reason}</strong>
          </Alert>
        );
      }

      if(isLoading) {
        return(<ProgressBar active now={100} label='正在投注'/>);
      }

      if(isSuccess !== '') {
        return (
          <Alert bsStyle="success">
            <strong>投注成功. 交易ID: <a href={"https://eospark.com/MainNet/tx/" + txid} target="new">{this.state.transaction_id}</a></strong>
          </Alert>
        );
      }
      return('');
    }


    return (
      <div>
        <h3>
        <Label bsStyle="success">第{this.state.period}期</Label>
        </h3>
        <br/>
        <h5>投注进度</h5><ProgressBar active bsStyle="info" now={this.state.betperson*10} label={this.state.betperson} />
        <Form style={{paddingTop: '1em'}}>
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
        <div style={{paddingTop: '2em'}}>
          <RenderStatus/>
        </div>
      </div>
    );
  }
}
module.hot.accept();
