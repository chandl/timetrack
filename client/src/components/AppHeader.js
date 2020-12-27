import React from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Button,
  Toolbar,
  Typography,
  withStyles
} from '@material-ui/core';
const styles = {
  flex: {
    flex: 1,
  }
}

const AppHeader = ({ classes }) => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        Time Tracker
      </Typography>
      <div className={classes.flex} />
      <Button color="inherit" component={Link} to="/">Home</Button>
      <Button color="inherit" component={Link} to="/time">Time Manager</Button>
    </Toolbar>
  </AppBar>
);

export default withStyles(styles)(AppHeader);