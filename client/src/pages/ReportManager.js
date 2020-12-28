import React, { Component, Fragment } from "react";
import { withRouter, Link } from "react-router-dom";
import { compose } from "recompose";
import {
    IconButton,
    Paper,
    Typography,
    withStyles
} from "@material-ui/core"
import {
    Delete as DeleteIcon,
    GetApp as DownloadIcon,
    Edit as EditIcon,
  } from "@material-ui/icons";
import { DataGrid } from "@material-ui/data-grid";

import { Fetch } from "../components/ManagerComponent";


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

const REPORT_COL_SORT = [
    {
      field: "startDate",
      sort: "desc",
    },
  ];
  


class ReportManager extends Component {
    reportColumns = [
        { field: "id", headerName: "Report #" , width: 100},
        { field: "startDate", headerName: "Start Date", width: 150 },
        { field: "endDate", headerName: "End Date", width: 150 },
        { field: "totalMinutes", headerName: "Total Time" },
        {
            field: "edit",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => { 
                let downloadColor = params.row.generatedFile ? "primary" : "secondary";

                return (
              <>
                <IconButton
                  component={Link}
                  to={`/report/${params.row.id}`}
                  color="inherit"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => this.deleteReport(params.row)}
                  color="inherit"
                >
                  <DeleteIcon />
                </IconButton>

                <IconButton 
                    component={Link}
                    to={"#"}
                    color={downloadColor}
                    >
                        <DownloadIcon />
                    </IconButton>
                </>
              
            )}
        }
    ];


    state = {
        loading: true,
        reports: [], 
        error: null
    }

    componentDidMount() {
        this.getReports();
    }

    async getReports() {
        const [reports, err] = await Fetch("get", "/report");
        if(err) {
            this.setState({error: err});
            return;
        }
        this.setState({
            loading: false,
            reports: reports
        });
    }

    saveReport = async (report) => {
        let err, res;
        if (report.id) {
            [res, err] = await Fetch("put", `/report/${report.id}`, report);
        } else {
            [res, err] = await Fetch("post", "/report", report);
        }

        if(err) {
            this.setState({error : err});
        }

        this.props.history.goBack();
        this.getReports();
    }

    deleteReport = async (report) => {
        if (window.confirm(`Are you sure you want to delete report "${report.id}"`)) {
            const [res, err] = await Fetch("delete", `/report/${report.id}`);
        
            if(err) {
                this.setState({error: err})
                return;
            }
        
            this.getPosts();
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <Fragment>
                <Typography variant="h4">Report Manager</Typography>
                {this.state.reports.length > 0 ? (
                    <Paper elevation={1} className={classes.reports}>
                        <div style={{ display: "flex", height: "100% "}}>
                            <div style={{ flexGrow: 1}}>
                               <DataGrid 
                                    autoHeight
                                    rowsPerPageOptions={[10, 25, 50, 100]}
                                    pageSize={25}
                                    showToolbar
                                    density="compact"
                                    sortModel={REPORT_COL_SORT}
                                    rows={this.state.reports}
                                    columns={this.reportColumns}
                                    checkboxSelection/>
                            </div>
                        </div>
                    </Paper>
                ) : (!this.state.loading && (
                    <Typography variant="subtitle1">No reports to display</Typography>
                    )
                )}
            </Fragment>
        );
    }
}

export default compose(withRouter, withStyles(styles))(ReportManager);
