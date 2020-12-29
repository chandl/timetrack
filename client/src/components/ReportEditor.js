import React, { useEffect } from "react";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  withStyles,
} from "@material-ui/core";
import StepperModal from "./StepperModal";
import { Fetch, formatMinutes } from "./ManagerComponent";

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

const ReportOverview = ({ classes, report }) => {
  const weeklyTimes = report.details.map((week) => {
    let time = 0;
    let billableTime = 0;
    week.customers.forEach((cust) =>
      cust.times.forEach((t) => {
        time += t.minutes;
        if (t.billable) billableTime += t.minutes;
      })
    );
    return {
      all: time,
      billable: billableTime,
    };
  });

  const billableTime = weeklyTimes
    .map((a) => a.billable)
    .reduce((a, b) => a + b);
  const totalTime = weeklyTimes.map((a) => a.all).reduce((a, b) => a + b);

  let week = 1;
  return (
    <div>
      <Typography variant="h4">Review Report</Typography>
      {/* {JSON.stringify(report)} */}
      <div className={classes.card}>
        <ReportCard
          title="General Info"
          content={
            <div>
              <Typography component="p">ID: {report.id}</Typography>
              <Typography component="p">
                Start Date: {report.startDate}
              </Typography>
              <Typography component="p">End Date: {report.endDate}</Typography>
              <Typography component="p">
                Weeks: {report.details.length}
              </Typography>
              <Typography component="p">
                Billable Time: {formatMinutes(billableTime)}
              </Typography>
              <Typography component="p">
                Total Time: {formatMinutes(totalTime)}
              </Typography>
            </div>
          }
        />

        {report.details.map((detail) => {
          return (
            <ReportCard
              title={`Week ${week++}`}
              content={
                <div>
                  <Typography component="p">
                    Start Date: {detail.startDate}
                  </Typography>
                  <Typography component="p">
                    End Date: {detail.endDate}
                  </Typography>
                  <Typography component="p">
                    Customers:{" "}
                    {detail.customers.length > 0
                      ? detail.customers.map((cust) => cust.customer).join(", ")
                      : "N/A"}
                  </Typography>
                  <Typography component="p">
                    Billable Time:{" "}
                    {formatMinutes(weeklyTimes[week - 2].billable)}
                  </Typography>
                  <Typography component="p">
                    Total Time: {formatMinutes(weeklyTimes[week - 2].all)}
                  </Typography>
                </div>
              }
            />
          );
        })}
      </div>
    </div>
  );
};

const ReportCard = ({ title, content }) => {
  return (
    <Card>
      <CardContent>
        <Typography color="textSecondary" variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" component="p">
          {content}
        </Typography>
      </CardContent>
    </Card>
  );
};

const ReportEditor = ({ classes, report, onSave, history }) => {
  const [activeReport, setActiveReport] = React.useState();
  const [steps, setSteps] = React.useState();

  useEffect(() => {
    getReport(report.id).then((rep) => {
      setActiveReport(rep);
      setSteps(generateSteps(rep));
    });
  }, [report.id]);

  const generateSteps = (report) => {
    let i = 1;
    const weeklyReview = report.details.map((week) => {
      return {
        name: `Review Week ${i++}`,
        content: (
          <div>
            Review week <br /> {JSON.stringify(week)}
          </div>
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
