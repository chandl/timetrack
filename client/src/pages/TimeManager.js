import React, { Component, Fragment } from "react";
import { withRouter, Route, Redirect, Link } from "react-router-dom";
import {
  withStyles,
  Typography,
  Fab,
  IconButton,
  Paper,
  Chip,
} from "@material-ui/core";

import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
} from "@material-ui/icons";
import { find } from "lodash";
import { compose } from "recompose";

import TimeEditor from "../components/TimeEditor";
import ErrorSnackbar from "../components/ErrorSnackbar";
import { Fetch, formatMinutes } from "../components/ManagerComponent";
import ConfirmDialog from "../components/ConfirmDialog";
import { TimeTable } from "../components/TimeTable";
import LoadingBackdrop from "../components/LoadingBackdrop";

const TIME_DEFAULTS = {
  minutes: 0,
  day: new Date().toISOString().split("T")[0],
  billable: true,
};

const styles = (theme) => ({
  posts: {
    marginTop: theme.spacing(2),
  },
  fab: {
    position: "absolute",
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      bottom: theme.spacing(2),
      right: theme.spacing(2),
    },
  },
});

class TimeManager extends Component {
  timeColumns = [
    { field: "day", headerName: "Date", width: 110 },
    { field: "customer", headerName: "Customer" },
    { field: "serviceItem", headerName: "SvcItem" },
    {
      field: "minutes",
      headerName: "Time",
      valueFormatter: (params) => formatMinutes(params.row.minutes),
    },
    {
      field: "notes",
      headerName: "Notes",
      width: 400,
      flex: 1,
      sortable: false,
    },

    {
      field: "billable",
      headerName: "Billable",
      sortable: false,
      renderCell: (params) => {
        if (params.row.billable) {
          return <Chip label="Yes" size="small" color="primary" />;
        } else {
          return <Chip label="No" size="small" color="secondary" />;
        }
      },
    },
    {
      field: "edit",
      headerName: "Actions",
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            component={Link}
            to={`/time/${params.row.id}`}
            color="inherit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => this.setState({ toDelete: params.row })}
            color="inherit"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];
  state = {
    loading: true,
    posts: [],
    customers: [],
    serviceItems: [],
    error: null,
    toDelete: null,
  };

  componentDidMount() {
    this.getPosts();
  }

  async getPosts() {
    await Fetch("get", "/time")
      .then((time) => {
        const customers = [...new Set(time.map((t) => t.customer))];
        const serviceItems = [...new Set(time.map((t) => t.serviceItem))];

        this.setState({
          loading: false,
          posts: time,
          customers: customers,
          serviceItems: serviceItems,
        });
      })
      .catch((err) => this.setState({ error: err }));
  }

  savePost = async (post) => {
    console.log("SAVING POST:::", post);

    if (post.id) {
      const id = post.id;

      // Remove unneeded info from post
      delete post.id;
      delete post.associatedReport;
      delete post.associatedReportId;
      delete post.active;
      delete post.finalized;
      await Fetch("put", `/time/${id}`, post).catch((err) =>
        this.setState({ error: err })
      );
    } else {
      await Fetch("post", "/time", post).catch((err) =>
        this.setState({ error: err })
      );
    }

    this.props.history.goBack();
    this.getPosts();
  };

  async deletePost(post) {
    await Fetch("delete", `/time/${post.id}`)
      .then(() => this.getPosts())
      .catch((err) => this.setState({ error: err }));
  }

  renderPostEditor = ({
    match: {
      params: { id },
    },
  }) => {
    if (this.state.loading) return null;
    let post = find(this.state.posts, { id: Number(id) });

    if (!post && id !== "new") return <Redirect to="/time" />;

    if (id === "new") post = Object.assign({}, TIME_DEFAULTS);
    return (
      <TimeEditor
        post={post}
        customers={this.state.customers}
        serviceItems={this.state.serviceItems}
        onSave={this.savePost}
      />
    );
  };

  render() {
    const { classes } = this.props;

    return (
      <Fragment>
        <Typography variant="h4">Time Manager</Typography>
        {this.state.posts.length > 0 ? (
          <Paper elevation={1} className={classes.posts}>
            <TimeTable
              rows={this.state.posts}
              columns={this.timeColumns}
              onMerge={() => this.getPosts()}
              props={{
                rowsPerPageOptions: [10, 25, 50, 100],
                pageSize: 25,
              }}
            />
          </Paper>
        ) : (
          !this.state.loading && (
            <Typography variant="subtitle1">No time to display</Typography>
          )
        )}
        {this.state.loading && <LoadingBackdrop />}
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
            message={this.state.error}
          />
        )}

        {this.state.toDelete && (
          <ConfirmDialog
            title="Permanently Delete Time?"
            message={`This will permanently delete this time (day: ${this.state.toDelete.day} | minutes: ${this.state.toDelete.minutes} | notes: '${this.state.toDelete.notes}'). Do you want to continue?`}
            onAccept={() => {
              this.deletePost(this.state.toDelete);
              this.setState({ toDelete: null });
            }}
            onCancel={() => {
              console.log("Cancelled deletion");
              this.setState({ toDelete: null });
            }}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(withRouter, withStyles(styles))(TimeManager);
