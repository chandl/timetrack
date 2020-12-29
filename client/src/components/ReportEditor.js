import React, { useEffect } from "react";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core";
import StepperModal from "./StepperModal";
import { Fetch } from "./ManagerComponent";

const styles = (theme) => ({
  marginTop: {
    marginTop: theme.spacing(2),
  },
});

const getReport = async (reportId) => {
  return Fetch("get", `/report/${reportId}`)
    .then((res) => res)
    .catch((err) => {
      this.setState({ error: err });
    });
};

const ReportEditor = ({ classes, report, onSave, history }) => {
  const [activeReport, setActiveReport] = React.useState();

  useEffect(() => {
    getReport(report.id)
      .then((res) => setActiveReport(res));
  }, [report.id]);

  const STEPS = [
    {
      name: "Review Report",
      content: (
        <div>
          <p>Review report</p>
          <br /> {JSON.stringify(activeReport)}
        </div>
      ),
      validate: () => Promise.resolve(),
      complete: () => Promise.resolve(),
    }, 
    // !activeReport ? [] : activeReport.times.map(time => {
    //   return {name: "AAA" + time,
    //   content: (<div></div>),
    //   validate: () => {},
    //   complete: () => {}}
    // })
  ];

  return (
    <StepperModal
      classes={classes}
      history={history}
      onSave={() => onSave(report)}
      onClose={() => onSave(report)}
      steps={STEPS}
    />
  );
};

export default compose(withRouter, withStyles(styles))(ReportEditor);
