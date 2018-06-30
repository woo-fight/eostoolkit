import Eos from 'eosjs'
import React from 'react'
import update from 'react-addons-update';
import { Button, Label } from 'react-bootstrap';
import scatter from 'scatter-client';
import config from 'config';

export const bindNameToState = (stateSetter, paramArray) => {
  const name = window.scatter.identity && window.scatter.identity.accounts.find(x => x.blockchain === 'eos')
    ? window.scatter.identity.accounts.find(x => x.blockchain === 'eos').name
    : '';

  stateSetter(paramArray.reduce((acc, param) => {
    acc[param] = name;
    return acc;
  }, {}));
}

export class ScatterConnect extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      connecting: false,
      error: false,
      scatter: window.scatter,
      identity: null
    }

    document.addEventListener('scatterLoaded', scatterExtension => {
      console.log('Scatter connected')
      // Scatter will now be available from the window scope.
      // At this stage the connection to Scatter from the application is
      // already encrypted.
      this.setState({ scatter: window.scatter, identity: window.scatter.identity });

      // It is good practice to take this off the window once you have
      // a reference to it.
      //window.scatter = null;
    })
  }

  connectIdentity() {
    scatter.login(config.customNetwork).then(async () => {
      console.log(this.state.scatter.identity);
      this.setState({ identity: window.scatter.identity });
    }).catch(error => {
      console.error(error);
    });

  }

  removeIdentity() {
    scatter.logout().then(() => {
      console.log(this.state.scatter.identity);
      this.setState({ identity: window.scatter.identity });
    }).catch((e) => {
      if (e.code == 423) {
        console.log('No identity to detach');
      }
    });
  }

  renderScatter() {
    const id = this.state.identity ? (
      <Label bsStyle="info">{this.state.identity.name}</Label>
    ) : (<div />);

    const button = this.state.identity ? (
      <Button type="submit" onClick={this.removeIdentity.bind(this)} bsStyle="warning">解绑身份</Button>
    ) : (
        <Button type="submit" onClick={this.connectIdentity.bind(this)} bsStyle="info">绑定身份</Button>
      );

    return (
      <div>

        <h3>{id} {button}</h3>

      </div>
    );
  }

  render() {
    if (this.state.scatter === undefined) {
      return (<h3>请使用Chrome浏览器<a href="https://scatter-eos.com/" target="new">安装Scatter钱包</a>(需要梯子)</h3>);
    } else {
      return (this.renderScatter());
    }
  }
}
