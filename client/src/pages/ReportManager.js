import React, { Component, Fragment } from "react";
import { withRouter, Redirect, Route, Link } from "react-router-dom";
import { compose } from "recompose";
import {
  Chip,
  Fab,
  IconButton,
  Paper,
  Typography,
  withStyles,
} from "@material-ui/core";
import {
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Loop as GeneratingIcon,
} from "@material-ui/icons";
import { DataGrid } from "@material-ui/data-grid";

import { find } from "lodash";
import { Fetch } from "../components/ManagerComponent";
import ErrorSnackbar from "../components/ErrorSnackbar";
import ReportCreator from "../components/ReportCreator";
import ReportEditor from "../components/ReportEditor";
import ConfirmDialog from "../components/ConfirmDialog";

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

const REPORT_COL_SORT = [
  {
    field: "startDate",
    sort: "desc",
  },
];

class ReportManager extends Component {
  reportColumns = [
    { field: "id", headerName: "Report #", width: 100 },
    { field: "startDate", headerName: "Start Date", width: 125 },
    { field: "endDate", headerName: "End Date", width: 120 },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      sortable: false,
      renderCell: (params) => {
        switch (params.row.status) {
          case "IN_PROGRESS":
            return <Chip label="In Progress" size="small" color="secondary" />;
          case "GENERATING":
            return <Chip label="Generating" size="small" />;
          case "COMPLETED":
            return <Chip label="Completed" size="small" color="primary" />;
          default:
            return <Chip label={params.row.status} size="small" />;
        }
      },
    },
    {
      field: "edit",
      headerName: "Actions",
      sortable: false,
      width: 200,
      renderCell: (params) => {
        return (
          <>

            <IconButton
              component={Link}
              to={`/report/${params.row.id}`}
              color="inherit"
              disabled={params.row.status === "COMPLETED" || params.row.status === "GENERATING"}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => {
                this.setState({
                  toDelete: params.row,
                });
              }}
              color="inherit"
              disabled={params.row.status === "COMPLETED" || params.row.status === "GENERATING"}
            >
              <DeleteIcon />
            </IconButton>

            {params.row.status === "GENERATING" && <IconButton 
              onClick={() => this.getReports()}
              color="primary">
                <GeneratingIcon/>
              </IconButton>}
            {params.row.generatedFile && <IconButton
              onClick={() => {
                window.location.href = params.row.generatedFile;
              }}
              color="primary"
            >
              <DownloadIcon />
            </IconButton>}
            
          </>
        );
      },
    },
  ];

  state = {
    loading: true,
    reports: [],
    error: null,
    toDelete: null,
  };

  componentDidMount() {
    this.getReports();
  }

  async getReports() {
    await Fetch("get", "/report")
      .then((reports) => {
        this.setState({
          loading: false,
          reports: reports,
        });
      })
      .catch((err) => this.setState({ error: err }));
  }

  saveReport = async (report) => {
    // TODO report updates
    /* if (report.id) {
      await Fetch("put", `/report/${report.id}`, report).catch((err) =>
        this.setState({ error: err })
      );
    } */

    this.props.history.goBack();
    this.getReports();
  };

  deleteReport = async (report) => {
    await Fetch("delete", `/report/${report.id}`)
      .then(() => this.getReports())
      .catch((err) => this.setState({ error: err }));
  };

  renderReportEditor = ({
    match: {
      params: { id },
    },
  }) => {
    if (this.state.loading) return null;

    if (id === "new") {
      return <ReportCreator report={{}} onSave={this.saveReport} />;
    }

    let report = find(this.state.reports, { id: Number(id) });
    if (!report && id !== "new") return <Redirect to="/report" />;

    return <ReportEditor report={report} onSave={this.saveReport} />;
  };

  render() {
    const { classes } = this.props;
    return (
      <Fragment>
        <Typography variant="h4">Report Manager</Typography>
        {this.state.reports.length > 0 ? (
          <Paper elevation={1} className={classes.reports}>
            <div style={{ display: "flex", height: "100% " }}>
              <div style={{ flexGrow: 1 }}>
                <DataGrid
                  autoHeight
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  pageSize={25}
                  showToolbar
                  density="compact"
                  sortModel={REPORT_COL_SORT}
                  rows={this.state.reports}
                  columns={this.reportColumns}
                />
              </div>
            </div>
          </Paper>
        ) : (
          !this.state.loading && (
            <Typography variant="subtitle1">No reports to display</Typography>
          )
        )}

        <Fab
          color="secondary"
          aria-label="add report"
          className={classes.fab}
          component={Link}
          to="/report/new"
        >
          <AddIcon />
        </Fab>
        <Route exact path="/report/:id" render={this.renderReportEditor} />
        {this.state.error && (
          <ErrorSnackbar
            onClose={() => this.setState({ error: null })}
            message={this.state.error.message}
          />
        )}

        {this.state.toDelete && (
          <ConfirmDialog
            title="Permanently Delete Report?"
            message={`This will permanently delete this report (id: ${this.state.toDelete.id} | start: ${this.state.toDelete.startDate} | end: ${this.state.toDelete.endDate}). Do you want to continue?`}
            onAccept={() => {
              this.deleteReport(this.state.toDelete);
              this.setState({ toDelete: null });
            }}
            onCancel={() => {
              console.log("Cancelled deletion");
              this.setState({ toDelete: null });
            }}
            state={this.state.toDelete}
          />
        )}
      </Fragment>
    );
  }
}

export default compose(withRouter, withStyles(styles))(ReportManager);
