import React from 'react'
import ReactDOM from 'react-dom'
import update from 'react-addons-update';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import { Navbar, Nav, NavItem, Panel, Alert, ButtonGroup, Button } from 'react-bootstrap';
import { ScatterConnect } from './scatter-client.jsx';
import { LinkContainer } from 'react-router-bootstrap';

import Lottery from './lottery/join.jsx'
import './theme.css';

const Home = () => (
  <Redirect from="/" to="/lottery" />
);

class Toolkit extends React.Component {
  constructor(props) {
    super(props)
  }



  render() {
    return (
      <Router>
      <div>
       <Navbar inverse fixedTop className="navbar">
        <Navbar.Header>
          <Navbar.Brand>
            <a href="/" target="_self">EOS夺宝游戏</a>
          </Navbar.Brand>
        </Navbar.Header>
      <Nav>
        <LinkContainer to="/lottery">
          <NavItem  onClick={ e => this.props.history.push("/lottery") } >
            首页
          </NavItem>
        </LinkContainer>
      </Nav>
      {/*
      <Nav>
        <LinkContainer to="/my">
          <NavItem >
            我的
          </NavItem>
        </LinkContainer>
      </Nav>
      */}
      </Navbar>

      <div className="container theme-showcase" role="main">
        <Panel bsStyle="primary">
          <Panel.Heading>
            <Panel.Title componentClass="h3">Scatter钱包插件</Panel.Title>
          </Panel.Heading>
          <Panel.Body><ScatterConnect/></Panel.Body>
        </Panel>
            <Route exact path="/" component={Home} />
            <Route path="/lottery" component={Lottery} />
        <p style={{float: 'right'}}>EOS121DAC 2018 </p>
      </div>
      </div>
      </Router>
    );
  }
}

ReactDOM.render(<Toolkit />, document.getElementById('app'));

module.hot.accept();
