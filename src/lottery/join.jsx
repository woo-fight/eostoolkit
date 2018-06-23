import React from 'react'
import { Panel } from 'react-bootstrap';
import BidTable from './bid-table.jsx'
import CreateBid from './create-bid.jsx'

export default class Names extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <Panel bsStyle="primary">
          <Panel.Heading>
            <Panel.Title componentClass="h3">投注</Panel.Title>
          </Panel.Heading>
          <Panel.Body><CreateBid/></Panel.Body>
        </Panel>
        <BidTable/>
      </div>
    );
  }
}
