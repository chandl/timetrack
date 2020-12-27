import React, { Component, Fragment } from 'react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
  withStyles,
  Typography,
  Fab,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import moment from 'moment';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import TimeEditor from '../components/TimeEditor';
import ErrorSnackbar from '../components/ErrorSnackbar';

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
      return await response.json();
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
            <List>
              {orderBy(this.state.posts, ['day', 'customer', 'serviceItem'], ['desc', 'asc']).map(post => (
                <ListItem key={post.id} button component={Link} to={`/time/${post.id}`}>
                  <ListItemText
                    primary={`${post.customer} | ${post.notes}`}
                    secondary={`${moment(post.day).fromNow()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => this.deletePost(post)} color="inherit">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
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