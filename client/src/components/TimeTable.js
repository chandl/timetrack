import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React from "react";
import ErrorSnackbar from "./ErrorSnackbar";
import { Fetch } from "./ManagerComponent";

const TIME_COL_SORT = [
  {
    field: "day",
    sort: "desc",
  },
];

export const TimeTable = ({ rows, columns, onMerge, props }) => {
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [error, setError] = React.useState(null);

  const mergeTimes = async (timeIdList) => {
    await Fetch("post", "/time/merge", {
      toMerge: timeIdList,
    })
      .then((res) => {
        console.log("Merged Time:::", res);
        setSelectedRows([]);
        onMerge();
      })
      .catch((err) => setError(err));
  };

  return (
    <div
      style={{
        display: "flex",
        alignContent: "center",
        flexDirection: "column",
        justifyContent: "flex-end",
        // height: 500
      }}
    >
      <div>
        {selectedRows.length > 1 && (
          <div>
            <Button
              onClick={() => mergeTimes(selectedRows)}
              variant="contained"
              color="primary"
              disableElevation
            >
              Merge Times
            </Button>
          </div>
        )}
      </div>

      <div style={{ alignItems: "stretch"}}>
        <DataGrid
          autoHeight
          showToolbar
          density="compact"
          sortModel={TIME_COL_SORT}
          rows={rows}
          columns={columns}
          onSelectionChange={(newSelection) => {
            setSelectedRows(newSelection.rowIds);
          }}
          {...props}
        />
      </div>
      {error && (
        <ErrorSnackbar onClose={() => setError(null)} message={error} />
      )}
    </div>
  );
};
