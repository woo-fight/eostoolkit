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

// console.log(document.querySelector(".buttons-wrap"));
export default class BidTable extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      list:[],
      detail:[],
      historyButton:'',
      loading: false
    };


    this.eosClient = EosClient();
  }

  componentDidMount() {
    setInterval(() => {
      this.getBids();
    }, 1000);

    setInterval(() => {
      this.refreshHistory();
    }, 1000);
  }

  queryrecord(period, e) {
    e.preventDefault();
    let response = {};
    response = lotterydata.getBettingsByperiod (period);
    this.setState({ detail : response});
  }
 
  refreshHistory () {
    var btns = [];
    if (lotterydata.gamerecords !== null) {
      for (var i = lotterydata.gamerecords.length - 1; i > 0; i--){
        var status = "";
        var style ="";
        if (i == lotterydata.gamerecords.length - 1) {
          style = "success";
          status = "(进行中)";
        }else {
          style = "primary";
          status = "(已结束)";
        }
        btns.push (<Button key={i} bsStyle={style}  bsSize="large" onClick={this.queryrecord.bind(this, i)}>第{i}期{status}</Button>)
      }
   
      const btnlist = (
        <div className="buttons-wrap">
        <ButtonToolbar>
          {btns}
        </ButtonToolbar>
        </div>);  

      this.setState({ historyButton: btnlist});
    }

  }
  getBids() {

    this.setState({ loading: true });
    
    if (lotterydata.gamerecords !== null && JSON.stringify(lotterydata.gamerecords) != '{}') {

      let list_tmp = lotterydata.gamerecords;
      list_tmp[list_tmp.length - 1].winner = '正在投注';
      list_tmp[list_tmp.length - 1].prize_pool = '正在投注';
      this.setState({list: list_tmp});
      this.setState({ data: lotterydata.gamerecords, loading: false });
    }
  }

  formatDate(date) {
    let newDate = new Date(date / 1000);
    return newDate.toUTCString();
  }

  render() {
    const { list, loading, detail} = this.state;
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
                    <span>{(row.value)}</span>
                  )
                },
                {
                  Header: "中奖金额",
                  accessor: "prize_pool",
                  Cell: row => (
                    <span>{(row.value)}</span>
                  )
                }
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
            {this.state.historyButton}
            <ReactTable
              columns={[
                {
                  Header: "投注账号",
                  id: "player_name",
                  accessor: "player_name"
                },
                {
                  Header: "投注金额",
                  accessor: "bet",
                  Cell: row => (
                    <span>{(row.value)}</span>
                  )
                },
                {
                  Header: "投注号码",
                  accessor: "lucky_number",
                  Cell: row => (
                    <span>{(row.value)}</span>
                  )
                }
              ]}
              pageSizeOptions = {[50,101]}
              defaultPageSize={101}
              data={detail}
              className="-striped -highlight"
              loading={loading} // Display the loading overlay when we need it
              nextText = '下一页'
              previousText = '上一页'
              loadingText = '查询中'
              noDataText = '无开奖记录'
              pageText = ''
              rowsText = '行'
            />
            <br />
          </Tab>
        </Tabs>

      </div>
    );
  }
}
