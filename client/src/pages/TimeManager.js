import React, { Component, Fragment } from 'react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Fab,
  IconButton,
  Paper,
} from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';


import { Delete as DeleteIcon, Add as AddIcon, Edit as EditIcon } from '@material-ui/icons';
import moment from 'moment';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import TimeEditor from '../components/TimeEditor';
import ErrorSnackbar from '../components/ErrorSnackbar';

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
    // { field: "id", headerName: "ID", width: 60 },
    { field: "day", headerName: "Date", width: 110},
    { field: "customer", headerName: "Customer" },
    { field: "serviceItem", headerName: "Service Item" },
    { field: "minutes", headerName: "Time", type: "number"},
    { field: "notes", headerName: "Notes", width:250, sortable: false},
    { field: "billable", headerName: "Billable"},
    { field: "edit", headerName: "Actions", width:500, renderCell: (params) => (
      <>
      {/* <ListItem key={post.id} button component={Link} to={`/time/${post.id}`} */}
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
      if(text.length == 0) {
        return null;
      }
      return JSON.parse(text);
    } catch (error) {
      console.error(error);
      this.setState({ error });
    }
  }

  async getPosts() {
    this.setState({ loading: false, posts: (await this.fetch('get', '/time')) || [] });
  }

  savePost = async (post) => {
    if (post.id) {
      await this.fetch('put', `/time/${post.id}`, post);
    } else {
      await this.fetch('post', '/time', post);
    }

    this.props.history.goBack();
    this.getPosts();
  }

  async deletePost(post) {
    if (window.confirm(`Are you sure you want to delete post "${post.id}"`)) {
      await this.fetch('delete', `/time/${post.id}`);
      this.getPosts();
    }
  }

  renderPostEditor = ({ match: { params: { id } } }) => {
    if (this.state.loading) return null;
    const post = find(this.state.posts, { id: Number(id) });

    if (!post && id !== 'new') return <Redirect to="/time" />;

    return <TimeEditor post={post} onSave={this.savePost} />;
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
                <DataGrid autoHeight autoPageSize showToolbar density="compact" sortModel={TIME_COL_SORT} rows={this.state.posts} columns={this.timeColumns} checkboxSelection />
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