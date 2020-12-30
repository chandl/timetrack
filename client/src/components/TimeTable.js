import { Button } from "@material-ui/core";
import { DataGrid } from "@material-ui/data-grid";
import React from "react";

const TIME_COL_SORT = [
  {
    field: "day",
    sort: "desc",
  },
];

export const TimeTable = ({ rows, columns, props }) => {
  const [selectedRows, setSelectedRows] = React.useState([]);

  return (
    <div
      style={{
        display: "flex",
        alignContent: "center",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div>
        {selectedRows.length > 1 ? (
          <div>
            <Button variant="contained" color="primary" disableElevation>
              Merge Times
            </Button>
          </div>
        ) : (
          <div>
            <Button variant="contained" disabled disableElevation>
              Merge Times
            </Button>
          </div>
        )}
      </div>

      <div style={{ flexGrow: 1 }}>
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
    </div>
  );
};
