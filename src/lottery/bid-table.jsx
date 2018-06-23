import React from "react";
import { render } from "react-dom";
import update from 'react-addons-update';
import EosClient from '../eos-client.jsx';
import { Button } from 'react-bootstrap';
import { Tabs, Tab, ButtonToolbar} from 'react-bootstrap';


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
      <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
        <Tab eventKey={1} title="投注榜">
        <Button type="submit" onClick={this.getBids.bind(this)}>刷新</Button>
        <ReactTable
          columns={[
            {
              Header: "期数",
              id: "newname",
              accessor: "newname"
            },
            {
              Header: "获奖者",
              accessor: "high_bid",
              Cell: row => (
                <span>{(row.value/10000)} EOS</span>
              )
            },
            {
              Header: "中奖金额",
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
        </Tab>
        <Tab eventKey={2} title="投注详情">
          {historyButton}
        </Tab>
      </Tabs>
      
      </div>
    );
  }
}
