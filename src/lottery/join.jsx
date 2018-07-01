import React from 'react'
import { Panel } from 'react-bootstrap';
import HistoryRecord from './history-record'
import Betting from './betting'

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
          <Panel.Body><Betting /></Panel.Body>
        </Panel>
        <Panel bsStyle="primary">
          <Panel.Heading>
            <Panel.Title componentClass="h3">开奖历史</Panel.Title>
          </Panel.Heading>
          <Panel.Body><HistoryRecord /></Panel.Body>
        </Panel>
      </div>
    );
  }
}
