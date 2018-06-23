import React from 'react'
import { Panel } from 'react-bootstrap';
import MyHistory from './myhistory.jsx'
import MyFinance from './myfinance.jsx'

export default class Names extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return (
      <div>
        <Panel bsStyle="primary">
          <Panel.Heading>
            <Panel.Title componentClass="h3">我的财务</Panel.Title>
          </Panel.Heading>
          <Panel.Body><MyFinance/></Panel.Body>
        </Panel>
        <Panel bsStyle="primary">
          <Panel.Heading>
            <Panel.Title componentClass="h3">我的投注</Panel.Title>
          </Panel.Heading>
          <Panel.Body><MyHistory/></Panel.Body>
        </Panel>
      </div>
    );
  }
}
