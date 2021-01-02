import React, { useEffect } from "react";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core";
import StepperModal from "./StepperModal";
import { Fetch } from "./ManagerComponent";
import { ReportOverview } from "./ReportOverview";
import { ReportWeek } from "./ReportWeek";
import LoadingBackdrop from "./LoadingBackdrop";
import ConfirmDialog from "./ConfirmDialog";
import { ReportByDay } from "./ReportByDay";

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

const finalizeReport = async (reportId) => {
  return Fetch("post", `/report/finalize/${reportId}`)
    .then((res) => res)
    .catch((err) => this.setState({ error: err }));
};

const ReportEditor = ({ classes, report, onSave, history }) => {
  const [toFinalize, setToFinalize] = React.useState();
  const [steps, setSteps] = React.useState();

  useEffect(() => {
    getReport(report.id).then((rep) => {
      setSteps(generateSteps(rep));
    });
  }, [report.id]);

  const generateSteps = (report) => {
    const overview = [
      {
        name: "Report Overview",
        content: <ReportOverview classes={classes} report={report} />,
        validate: () => Promise.resolve(),
        complete: () => Promise.resolve(),
        isEnabled: () => true,
      },
    ];

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

    const reportByDay = [
      {
        name: "Final Review",
        content: <ReportByDay weeks={report.details} />,
        validate: () => Promise.resolve(),
        complete: () => Promise.resolve(),
        isEnabled: () => true,
      },
    ];

    return overview.concat(weeklyReview).concat(reportByDay);
  };

  return steps ? (
    <div>
      <StepperModal
        classes={classes}
        history={history}
        onSave={() => {
          if ("COMPLETED" === report.status) {
            return onSave(report);
          }
          return setToFinalize([
            report,
            async () =>
              await new Promise(() => setTimeout(() => onSave(report), 250)),
          ]);
        }}
        onClose={() => onSave(report)}
        steps={steps}
      />

      {toFinalize && (
        <ConfirmDialog
          title="Finalize Report?"
          message={`This will permanently finalize this report and generate the time tracker file. You will not be able to make additional changes or add new time after proceeding. Continue?`}
          onAccept={() => {
            finalizeReport(toFinalize[0].id);
            toFinalize[1](); // callback
            setToFinalize(null);
          }}
          onCancel={() => {
            toFinalize[1](); // callback
            setToFinalize(null);
          }}
          state={toFinalize}
        />
      )}
    </div>
  ) : (
    <LoadingBackdrop />
  );
};

export default compose(withRouter, withStyles(styles))(ReportEditor);
