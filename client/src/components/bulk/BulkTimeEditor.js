import React from "react";
import {
  withStyles,
  Card,
  CardContent,
  Modal,
  Button,
  Typography,
  LinearProgress,
} from "@material-ui/core";

import { IconButton, Chip } from "@material-ui/core";

import { Delete as DeleteIcon } from "@material-ui/icons";

import ErrorSnackbar from "../ErrorSnackbar";
import { Fetch, formatMinutes } from "../../components/ManagerComponent";

import { TimeTable } from "../TimeTable";
import { parseCsvToTimes } from "./BulkTimeParser";

import { CSVReader } from "react-papaparse";

import { compose } from "recompose";
import { withRouter } from "react-router-dom";

const styles = (theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "90%",
    height: "90%",
    // maxWidth: 500,
  },
  modalCardContent: {
    display: "flex",
    flexDirection: "column",
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
});

const buttonRef = React.createRef();

const BulkTimeEditor = ({ classes, onSave, history, lockedDown, onCancel }) => {
  const [error, setError] = React.useState(null);
  const [times, setTimes] = React.useState(null);
  const [dayTimes, setDayTimes] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);

  const timeColumns = [
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
      sortable: true,
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
            onClick={() => {
              deleteTime(params.row);
              calculateDayTimes(times);
            }}
            color="inherit"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  const deleteTime = (timeRow) => {
    // times.remove(timeRow);
    setTimes(times.filter((time) => time.id != timeRow.id));
  };

  const onClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      history.goBack();
    }
  };

  const handleOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (buttonRef.current) {
      buttonRef.current.open(e);
    }
  };

  const calculateDayTimes = (times) => {
    // Calculate minutes per day
    const days = new Set(times.map((t) => t.day));
    const dt = [];
    days.forEach((day) => {
      let min = 0;
      times.filter((t) => t.day === day).forEach((t) => (min += t.minutes));
      dt.push({
        day: day,
        minutes: min,
      });
    });
    console.log("Minutes Per Day:::", dt);

    setDayTimes(dt);
  };

  const handleOnFileLoad = (data) => {
    console.log("------------LOADING---------------");
    const times = parseCsvToTimes(data);
    setTimes(times);
    calculateDayTimes(times);
    console.log("---------------------------");
  };

  const handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
  };

  const handleOnRemoveFile = (data) => {
    console.log("Clearing File");
    setTimes(null);
    setDayTimes(null);
  };

  const handleRemoveFile = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (buttonRef.current) {
      buttonRef.current.removeFile(e);
    }
  };

  const handleUpload = async () => {
    setUploading(true);

    await times.forEach((t) => {
      delete t.id;
      console.log("UPLOADING time:", t);
      Fetch("post", "/time", t).catch((err) => setError(err));
    });

    handleOnRemoveFile();
    onSave();
  };

  return (
    <div style={{ display: "flex" }}>
      <Modal className={classes.modal} onClose={() => onClose()} open>
        <Card className={classes.modalCard}>
          <CardContent className={classes.modalCardContent}>
            <Typography variant="h4">Bulk Time Importer</Typography>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{ width: "100%", height: "75vh", overflowY: "scroll" }}
              >
                {(times && (
                  <div>
                    <Typography>
                      Review times to import. If this looks good, click the
                      'Upload' button. If not, edit your timesheet csv and
                      re-upload.
                    </Typography>

                    {dayTimes && (
                      <ul>
                        {dayTimes.map((dayTime) => (
                          <li>
                            {dayTime.day} : {formatMinutes(dayTime.minutes)}
                          </li>
                        ))}
                      </ul>
                    )}

                    <TimeTable
                      rows={times}
                      columns={timeColumns}
                      props={{
                        rowsPerPageOptions: [5, 15, 25, 50, 100],
                        pageSize: 25,
                        checkboxSelection: false,
                      }}
                    />
                  </div>
                )) || (
                  <Typography>
                    Upload CSV File to Bulk Import Time Data
                  </Typography>
                )}
              </div>

              <CSVReader
                ref={buttonRef}
                onFileLoad={handleOnFileLoad}
                onError={handleOnError}
                noClick
                noDrag
                onRemoveFile={handleOnRemoveFile}
              >
                {({ file }) => (
                  <aside
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      marginBottom: 10,
                      justifyContent: "center",
                    }}
                  >
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={handleOpenDialog}
                      style={{ marginRight: "5px" }}
                    >
                      Browse Files
                    </Button>
                    <Button
                      color="inherit"
                      variant="contained"
                      onClick={handleRemoveFile}
                      style={{ marginRight: "5px" }}
                    >
                      Clear
                    </Button>
                    <div
                      style={{
                        borderWidth: 1,
                        borderStyle: "solid",
                        borderColor: "#ccc",
                        height: 30,
                        lineHeight: 2.5,
                        marginTop: 5,
                        marginBottom: 5,
                        marginRight: 5,
                        paddingLeft: 13,
                        // paddingTop: 3,
                        width: "60%",
                      }}
                    >
                      {file && file.name}
                    </div>
                    <Button
                      color="secondary"
                      variant="contained"
                      size="small"
                      disabled={!times}
                      onClick={handleUpload}
                    >
                      Upload
                    </Button>
                  </aside>
                )}
              </CSVReader>
            </div>

            {error && (
              <ErrorSnackbar onClose={() => setError(null)} message={error} />
            )}
          </CardContent>
        </Card>
      </Modal>
    </div>
  );
};

export default compose(withRouter, withStyles(styles))(BulkTimeEditor);
