import React from 'react'
import update from 'react-addons-update';
import { Grid, Row, Col, Panel, Form, FormGroup, FormControl, ControlLabel, HelpBlock,ListGroup,ListGroupItem, Button, ProgressBar, Alert, Table, Popover, OverlayTrigger } from 'react-bootstrap';
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
      eos: null
    };

    document.addEventListener('scatterLoaded', scatterExtension => {
      console.log('Scatter connected')

      setInterval(() => {
        bindNameToState(this.setState.bind(this), ['bidder']);
      }, 1000);

      /*
      let client = EosClient();
      this.setState({ eos: client});

      */
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

    let respone = {};
    console.log (Lottery);
    respone = await Lottery.joinGame(5);
    console.log('joinGame respone', respone);

    /*
    this.state.eos.transaction(tr => {
      tr.bidname({
        bidder: this.state.bidder,
        newname: this.state.name,
        bid: this.state.bid + ' EOS',
      })
    }).then((data) => {
      console.log(data);
      this.setState({loading:false, error:false});
    }).catch((e) => {
      let error = JSON.stringify(e);
      this.setState({loading:false, error:true});

      if(error.includes('must increase bid by 10%')) {
        this.setState({reason:'Increase bid by 10%'});
      } else if(error.includes('Missing required accounts')) {
        this.setState({reason:'Incorrect scatter account - please review chain id, network, and account name.'});
      }
    });
    */
    
  }

  render() {
    const isError = this.state.error;
    const isLoading = this.state.loading;
    const isSuccess = this.state.success;

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
            <strong>投注成功. 交易ID: <a href={"https://eospark.com/MainNet/tx/" + isSuccess} target="new">{isSuccess}</a></strong>
          </Alert>
        );
      }
      return('');
    }

    return (
      <div>
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
