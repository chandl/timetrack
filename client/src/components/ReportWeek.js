import React from "react";
import { Link } from "react-router-dom";

import { Chip, IconButton, Typography } from "@material-ui/core";
import { Delete as DeleteIcon, Edit as EditIcon } from "@material-ui/icons";
import { TimeTable } from "./TimeTable";
import {
  Fetch,
  formatMinutes,
  roundMinutesToNearestFifteen,
} from "./ManagerComponent";
import ReportCustomerTabs from "./ReportCustomerTabs";
import ErrorSnackbar from "./ErrorSnackbar";
import ConfirmDialog from "./ConfirmDialog";
import { WeeklyTimeList } from "./WeeklyTimeList";

export const ReportWeek = ({ week, reload }) => {
  const [timeToDelete, setTimeToDelete] = React.useState(null);
  const [error, setError] = React.useState(null);

  const deleteTime = async (time) => {
    await Fetch("delete", `/time/${time.id}`)
      .then(() => reload())
      .catch((err) => setError(err));
  };

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
      field: "roundedMinutes",
      headerName: "Rounded",
      valueFormatter: (params) =>
        formatMinutes(roundMinutesToNearestFifteen(params.row.minutes)),
      sortComparator: (v1, v2, a, b) => a.row.minutes - b.row.minutes
    },
    {
      field: "notes",
      headerName: "Notes",
      width: 300,
      flex: 1,
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
            disabled={params.row.finalized}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => setTimeToDelete(params.row)}
            color="inherit"
            disabled={params.row.finalized}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  // index, content, label
  let index = 0;
  const customerTabs = week.customers
    .sort((a, b) => {
      // Always sort customer names in ascending alphabetic order
      return a.customer < b.customer? -1 : 1;
    })
    .map((cust) => {
      return {
        index: index++,
        label: cust.customer,
        content: (
          <div style={{ width: "100%" }}>
            <TimeTable
              rows={cust.times}
              columns={timeColumns}
              onMerge={() => reload()}
              props={{
                rowsPerPageOptions: [5, 15, 25, 50, 100],
                pageSize: 25,
                checkboxSelection: true,
              }}
            />
          </div>
        ),
      };
    })
    .concat([
      {
        index: index++,
        label: "Daily Overview",
        content: <div style={{ maxHeight: 550 }}><WeeklyTimeList week={week} /></div>,
      },
    ]);
  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h5">
        Reviewing Week: {week.startDate} - {week.endDate}{" "}
      </Typography>

      <p>
        Here, you can review the week and make any changes necessary to your
        tracked time. Time is organized by customer; you can edit, merge, and
        delete times on each customer's tab. The 'Daily Overview' tab will allow
        you to preview how times will be split between weekdays and reported in
        the end.
      </p>

      <div>
        {week.customers.length > 0 ? (
          <div>
            <ReportCustomerTabs customerTabs={customerTabs} />
          </div>
        ) : (
          <Typography variant="subtitle1">
            No time to display for this week...
          </Typography>
        )}
      </div>
      {timeToDelete && (
        <ConfirmDialog
          title="Permanently Delete Time?"
          message={`This will permanently delete this time (day: ${timeToDelete.day} | minutes: ${timeToDelete.minutes} | notes: '${timeToDelete.notes}'). Do you want to continue?`}
          onAccept={() => {
            deleteTime(timeToDelete);
            setTimeToDelete(null);
          }}
          onCancel={() => {
            console.log("Cancelled deletion");
            setTimeToDelete(null);
          }}
        />
      )}
      {error && (
        <ErrorSnackbar onClose={() => setError(null)} message={error} />
      )}
    </div>
  );
};
