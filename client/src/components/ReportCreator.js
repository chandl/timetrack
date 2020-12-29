import React from "react";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { TextField, withStyles } from "@material-ui/core";
import { Fetch } from "./ManagerComponent";
import StepperModal from "./StepperModal";

const styles = (theme) => ({
  marginTop: {
    marginTop: theme.spacing(2),
  },
});

const DateRangePicker = ({ classes, report }) => {
  return (
    <div>
      <form className={classes.container} noValidate>
        <TextField
          id="startDate"
          label="Start Date"
          type="date"
          className={classes.textField}
          defaultValue={report.startDate}
          onChange={(e) => {
            report.startDate = e.target.value;
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          id="endDate"
          label="End Date"
          type="date"
          className={classes.textField}
          defaultValue={report.endDate}
          onChange={(e) => {
            report.endDate = e.target.value;
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </form>
    </div>
  );
};

const validateReportDateRange = (report) => {
  const errors = [];
  if (!report.startDate) {
    errors.push("Start date must be selected");
  }
  if (!report.endDate) {
    errors.push("End date must be selected");
  }
  if (report.startDate && report.endDate && report.startDate > report.endDate) {
    errors.push("Start date must be before end date");
  }
  if (errors.length > 0) {
    return Promise.reject(new Error(errors.join(", ") + "."));
  }

  return Promise.resolve();
};

const createReport = (report) => {
  return Fetch("post", "/report", report)
    .then((res) => res)
    .catch((err) => {
      throw new Error(err);
    });
};

const ReportCreator = ({ classes, report, onSave, history }) => {
  const [activeReport, setActiveReport] = React.useState();

  const STEPS = [
    {
      name: "Select Report Date Range",
      content: <DateRangePicker classes={classes} report={report} />,
      validate: () => validateReportDateRange(report),
      complete: () => createReport(report).then((res) => setActiveReport(res)),
    },
    {
      name: "Confirm Report",
      content: <p>{JSON.stringify(activeReport)}</p>,
      validate: () => Promise.resolve(),
      complete: () => Promise.resolve(),
    },
  ];

  return (
    <StepperModal
      classes={classes}
      steps={STEPS}
      onClose={() => onSave(report)}
      onSave={() => onSave(report)}
    />
  );
};

export default compose(withRouter, withStyles(styles))(ReportCreator);
