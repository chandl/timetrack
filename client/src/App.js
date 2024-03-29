import React, { Fragment } from "react";
import { CssBaseline, withStyles } from "@material-ui/core";
import { Route, BrowserRouter as Router } from "react-router-dom";

import AppHeader from "./components/AppHeader";
import Home from "./pages/Home";
import TimeManager from "./pages/TimeManager";
import ReportManager from "./pages/ReportManager";

const styles = (theme) => ({
  main: {
    padding: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2),
    },
  },
});

const App = ({ classes }) => (
  <Router basename="/track">
    <Fragment>
      <CssBaseline />
      <AppHeader />
      <main className={classes.main}>
        <Route exact path="/" component={Home}></Route>
        <Route path="/time" component={TimeManager}></Route>
        <Route path="/report" component={ReportManager}></Route>
      </main>
    </Fragment>
  </Router>
);

export default withStyles(styles)(App);
