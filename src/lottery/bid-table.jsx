import React from "react";
import { render } from "react-dom";
import update from 'react-addons-update';
import EosClient from '../eos-client.jsx';
import { Button } from 'react-bootstrap';

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

export default class BidTable extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      loading:false
    };


    this.eosClient = EosClient();
  }

  componentDidMount() {
    this.getBids();
  }

  getBids() {

    this.setState({loading:true});
    var bids = {
      json: true,
      scope: "eosio",
      code: "eosio",
      table: "namebids",
      limit: 10000
    }

    this.eosClient.getTableRows(bids).then((table)=>{
      this.setState({data: table.rows,loading:false});
    });
  }

  formatDate(date) {
    let newDate = new Date(date/1000);
    return newDate.toUTCString();
  }

  render() {
    const { data, loading } = this.state;
    return (
      <div>
        <Button type="submit" onClick={this.getBids.bind(this)}>刷新</Button>
        <ReactTable
          columns={[
            {
              Header: "开奖期数",
              id: "newname",
              accessor: "newname"
            },
            {
              Header: "开奖时间",
              accessor: "high_bidder"
            },
            {
              Header: "中奖地址",
              accessor: "high_bid",
              Cell: row => (
                <span>{(row.value/10000)} EOS</span>
              )
            },
            {
              Header: "中奖号码",
              accessor: "last_bid_time",
              Cell: row => (
                <span>{this.formatDate(row.value)}</span>
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
      </div>
    );
  }
}
