import './utils/Fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import RouterConstants from './constants/RouterConstants';
import MainView from './containers/MainView';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path={RouterConstants.main} component={MainView} />
          <Route component={MainView}/>
        </Switch>
      </Router>
    )
  }
}

ReactDOM.render(<App name='App' />, document.getElementById('app'));
