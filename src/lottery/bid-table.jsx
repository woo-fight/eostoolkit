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
      list:[],
      loading: false
    };


    this.eosClient = EosClient();
  }

  componentDidMount() {
    console.log('componentDidMount bid-table');

    setInterval(() => {
      this.getBids();
    }, 1000);
  }

  getBids() {

    this.setState({ loading: true });
    
    let list_tmp = lotterydata.gamerecords;
    list_tmp[list_tmp.length - 1].winner = '正在投注';
    list_tmp[list_tmp.length - 1].prize_pool = '正在投注';
    this.setState({list: list_tmp});

    if (lotterydata.gamerecords !== null) {
      this.setState({ data: lotterydata.gamerecords, loading: false });
    }
  }

  formatDate(date) {
    let newDate = new Date(date / 1000);
    return newDate.toUTCString();
  }

  render() {
    const { list, loading } = this.state;
    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
          <Tab eventKey={1} title="往期开奖">
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
              data={list}
              className="-striped -highlight"
              loading={loading} // Display the loading overlay when we need it
              filterable
              defaultSorted={[
                {
                  id: "high_bid",
                  desc: true
                }
              ]}
              nextText = '下一页'
              previousText = '上一页'
              loadingText = '查询中'
              noDataText = '无开奖记录'
              pageText = ''
              rowsText = '行'
            />
            <br />
          </Tab>
          <Tab eventKey={2} title="开奖详情">
            {historyButton}
          </Tab>
        </Tabs>

      </div>
    );
  }
}
