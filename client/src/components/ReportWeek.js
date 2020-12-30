import { Chip, IconButton, Typography } from "@material-ui/core";
import { Delete as DeleteIcon, Edit as EditIcon } from "@material-ui/icons";
import { TimeTable } from "./TimeTable";
import {
  formatMinutes,
  roundMinutesToNearestFifteen,
} from "./ManagerComponent";
import ReportCustomerTabs from "./ReportCustomerTabs";

export const ReportWeek = ({ week }) => {
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
    },
    {
      field: "notes",
      headerName: "Notes",
      width: 300,
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
          <IconButton color="inherit">
            <EditIcon />
          </IconButton>
          <IconButton color="inherit">
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  // index, content, label
  let index = 0;
  const customerTabs = week.customers.map((cust) => {
    console.log("CUST TIMES:::", cust.times);
    return {
      index: index++,
      label: cust.customer,
      content: (
        <div style={{ width: "100%" }}>
          <TimeTable
            rows={cust.times}
            columns={timeColumns}
            props={{
              rowsPerPageOptions: [5, 10, 15],
              pageSize: 5,
            }}
          />
        </div>
      ),
    };
  });
  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h5">
        Reviewing Week: {week.startDate} - {week.endDate}{" "}
      </Typography>

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
    </div>
  );
};
