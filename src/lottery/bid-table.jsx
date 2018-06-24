import React from "react";
import { render } from "react-dom";
import update from 'react-addons-update';
import EosClient from '../eos-client.jsx';
import { Button } from 'react-bootstrap';
import { Tabs, Tab, ButtonToolbar } from 'react-bootstrap';
// import Lottery from '../services/lottery.js'
import lotterydata from './js/lotterydata.js'

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

const historyButton = (

  <ButtonToolbar>
    {/* Provides extra visual weight and identifies the primary action in a set of buttons */}
    <Button bsStyle="success">Primary</Button>

    {/* Indicates a successful or positive action */}
    <Button bsStyle="success">Success</Button>

    {/* Contextual button for informational alert messages */}
    <Button bsStyle="success">Info</Button>

    {/* Indicates caution should be taken with this action */}
    <Button bsStyle="success">Warning</Button>

    {/* Indicates a dangerous or potentially negative action */}
    <Button bsStyle="success">Danger</Button>
  </ButtonToolbar>);

export default class BidTable extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      loading: false
    };


    this.eosClient = EosClient();
  }

  componentDidMount() {
    console.log('componentDidMount bid-table');
    this.getBids();
  }

  getBids() {

    this.setState({ loading: true });
    // var bids = {
    //   json: true,
    //   scope: "eosio",
    //   code: "eosio",
    //   table: "namebids",
    //   limit: 10000
    // }

    // this.eosClient.getTableRows(bids).then((table)=>{
    //   this.setState({data: table.rows,loading:false});
    // });
    // await lotterydata.load(Lottery, this.state.bidder);
    if (lotterydata.gamerecords !== null) {
      this.setState({ data: lotterydata.gamerecords, loading: false });
    }
    console.log("&&&&&&&&&&&&&&&", lotterydata.gamerecords);
  }

  formatDate(date) {
    let newDate = new Date(date / 1000);
    return newDate.toUTCString();
  }

  render() {
    const { data, loading } = this.state;
    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
          <Tab eventKey={1} title="投注榜">
            <Button type="submit" onClick={this.getBids.bind(this)}>刷新</Button>
            <ReactTable
              columns={[
                {
                  Header: "期数",
                  id: "g_id",
                  accessor: "g_id"
                },
                {
                  Header: "获奖者",
                  accessor: "winner",
                  Cell: row => (
                    <span>{(row.value)} </span>
                  )
                },
                {
                  Header: "中奖金额",
                  accessor: "prize_pool",
                  Cell: row => (
                    <span>{(row.value)}</span>
                  )
                },
              ]}
              defaultPageSize={20}
              data={data}
              className="-striped -highlight"
              loading={loading} // Display the loading overlay when we need it
              filterable
              defaultSorted={[
                {
                  id: "high_bid",
                  desc: true
                }
              ]}
            />
            <br />
          </Tab>
          <Tab eventKey={2} title="投注详情">
            {historyButton}
          </Tab>
        </Tabs>

      </div>
    );
  }
}
