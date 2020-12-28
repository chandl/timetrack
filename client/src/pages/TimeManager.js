import React, { Component, Fragment } from 'react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Fab,
  IconButton,
  Paper,
  Button
} from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';

import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@material-ui/icons';
import { find } from 'lodash';
import { compose } from 'recompose';

import TimeEditor from '../components/TimeEditor';
import ErrorSnackbar from '../components/ErrorSnackbar';

const FORMAT_MINUTES = (n) => n >= 60? `0${n / 60 ^ 0}`.slice(-2) + 'h ' + ('0' + n % 60).slice(-2) + "m" : ('0' + n % 60).slice(-2) + "m";

const TIME_DEFAULTS = {
  minutes: 0,
  day: new Date().toISOString().split("T")[0],
  billable: true
}

const TIME_COL_SORT = [
  {
    field: 'day',
    sort: 'desc',
  },
];

const styles = theme => ({
  posts: {
    marginTop: theme.spacing(2),
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
});

const API = process.env.REACT_APP_API || 'http://localhost:3000';

class TimeManager extends Component {

  timeColumns = [
    { field: "day", headerName: "Date", width: 110},
    { field: "customer", headerName: "Customer" },
    { field: "serviceItem", headerName: "SvcItem" },
    { field: "minutes", headerName: "Time", valueFormatter: (params) => FORMAT_MINUTES(params.row.minutes)},
    { field: "notes", headerName: "Notes", width:250, sortable: false},
    { field: "billable", headerName: "Billable", renderCell: (params) => {
      if(params.row.billable) {
        return (<Button variant="contained" size="small" color="primary">
                  Yes
                </Button>)
      } else {
        return (<Button variant="contained" size="small" color="secondary">
                  No
                </Button>)
      }
    }},
    { field: "edit", headerName: "Actions", width:100, renderCell: (params) => (
      <>
      <IconButton component={Link} to={`/time/${params.row.id}`} color="inherit">
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => this.deletePost(params.row)} color="inherit">
        <DeleteIcon />
      </IconButton>
      </>
    )}
  ]
  state = {
    loading: true,
    posts: [],
    customers: [],
    serviceItems: [],
    error: null,
  };

  componentDidMount() {
    this.getPosts();
  }

  async fetch(method, endpoint, body) {
    try {
      const response = await fetch(`${API}${endpoint}`, {
        method,
        body: body && JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        },
      });
      const text = await response.text();
      if(text.length === 0 && response.ok) {
        return null;
      }
      if(!response.ok) {
        throw new Error(`Failed to Save Post; Error=${text}; Status=${response.statusText}. Send this error to chandler so he can fix 😎`);
      }
      return JSON.parse(text);
    } catch (error) {
      console.error(error);
      this.setState({ error});
    }
  }

  async getPosts() {
    const time = await this.fetch('get', '/time') || [];
    const customers = [...new Set(time.map(t=>t.customer))];
    const serviceItems = [...new Set(time.map(t=>t.serviceItem))];

    this.setState({ loading: false, posts: time, customers: customers, serviceItems: serviceItems });
  }

  savePost = async (post) => {
    console.log("SAVING POST:::", post);
    if (post.id) {
      const id = post.id;

      // Remove unneeded info from post
      delete post.id;
      delete post.associatedReport;
      await this.fetch('put', `/time/${id}`, post);
    } else {
      await this.fetch('post', '/time', post);
    }

    this.props.history.goBack();
    this.getPosts();
  }

  async deletePost(post) {
    if (window.confirm(`Are you sure you want to delete time "${post.id}"`)) {
      await this.fetch('delete', `/time/${post.id}`);
      this.getPosts();
    }
  }

  renderPostEditor = ({ match: { params: { id } } }) => {
    if (this.state.loading) return null;
    let post = find(this.state.posts, { id: Number(id) });

    if (!post && id !== 'new') return <Redirect to="/time" />;

    if (id === "new") post = Object.assign({}, TIME_DEFAULTS);
    return <TimeEditor post={post} customers={this.state.customers} serviceItems={this.state.serviceItems} onSave={this.savePost} />;
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography variant="h4">Time Manager</Typography>
        {this.state.posts.length > 0 ? (
          <Paper elevation={1} className={classes.posts}>
            <div style={{ display: 'flex', height: '100%' }}>
              <div style={{ flexGrow: 1 }}>
                <DataGrid autoHeight rowsPerPageOptions={[10, 25, 50, 100]} pageSize={10} showToolbar density="compact" sortModel={TIME_COL_SORT} rows={this.state.posts} columns={this.timeColumns} checkboxSelection />
              </div>
            </div>
          </Paper>
        ) : (
          !this.state.loading && <Typography variant="subtitle1">No time to display</Typography>
        )}
        <Fab
          color="secondary"
          aria-label="add"
          className={classes.fab}
          component={Link}
          to="/time/new"
        >
          <AddIcon />
        </Fab>
        <Route exact path="/time/:id" render={this.renderPostEditor} />
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={this.state.error.message}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(
  withRouter,
  withStyles(styles),
)(TimeManager);