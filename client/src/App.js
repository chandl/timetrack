import React, { Fragment } from 'react';
import {
  CssBaseline,
  withStyles,
} from '@material-ui/core';
import { Route, BrowserRouter as Router } from 'react-router-dom';

import AppHeader from './components/AppHeader';
import Home from './pages/Home';
import TimeManager from './pages/TimeManager';

const styles = theme => ({
  main: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
});

const App = ({ classes }) => (
  <Router>
    <Fragment>
      <CssBaseline />
      <AppHeader />
      <main className={classes.main}>
        <Route exact path="/" component={Home}></Route>
        <Route path="/time" component={TimeManager}></Route>
      </main>
    </Fragment>
  </Router>
);

export default withStyles(styles)(App);