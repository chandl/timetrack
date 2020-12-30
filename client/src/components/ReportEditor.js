import React, { useEffect } from "react";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core";
import StepperModal from "./StepperModal";
import { Fetch } from "./ManagerComponent";
import { ReportOverview } from "./ReportOverview";
import { ReportWeek } from "./ReportWeek";

const styles = (theme) => ({
  marginTop: {
    marginTop: theme.spacing(2),
  },
  card: {
    display: "flex",
    flexDirection: "row",
    margin: theme.spacing(2),
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
  // const [activeReport, setActiveReport] = React.useState();
  const [steps, setSteps] = React.useState();

  useEffect(() => {
    getReport(report.id).then((rep) => {
      // setActiveReport(rep);
      setSteps(generateSteps(rep));
    });
  }, [report.id]);

  const generateSteps = (report) => {
    let i = 1;
    const weeklyReview = report.details.map((week) => {
      return {
        name: `Review Week ${i++}`,
        content: (
          <ReportWeek
            week={week}
            reload={() =>
              getReport(report.id).then((rep) => setSteps(generateSteps(rep)))
            }
          />
        ),
        validate: () => Promise.resolve(),
        complete: () => Promise.resolve(),
        isEnabled: () => true,
      };
    });

    return [
      {
        name: "Report Overview",
        content: <ReportOverview classes={classes} report={report} />,
        validate: () => Promise.resolve(),
        complete: () => Promise.resolve(),
        isEnabled: () => true,
      },
    ]
      .concat(weeklyReview)
      .concat([
        {
          name: "Finalize Report",
          content: (
            <div>
              <p>Finalize Report</p>
              <br /> TODO
            </div>
          ),
          validate: () => Promise.resolve(),
          complete: () => Promise.resolve(),
          isEnabled: () => true,
        },
      ]);
  };

  return steps ? (
    <StepperModal
      classes={classes}
      history={history}
      onSave={() => onSave(report)}
      onClose={() => onSave(report)}
      steps={steps}
    />
  ) : (
    <span>Loading steps...</span>
  );
};

export default compose(withRouter, withStyles(styles))(ReportEditor);
