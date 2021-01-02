import { Card, CardContent, Typography } from "@material-ui/core";
import { formatMinutes } from "./ManagerComponent";

export const ReportOverview = ({ classes, report }) => {
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
      <Typography variant="h4">Report Overview</Typography>
      <p>
        Here is an overview of the time that you tracked between{" "}
        {report.startDate} and {report.endDate}. You will be able to delete,
        modify, and merge times for each week in the next sections. If you need
        to add time, close this report and go to the "Time Manager" tab. Any new
        times will automatically be added to this report if it is in the
        report's time range. Feel free to ask for help!
      </p>
      <div className={classes.card}>
        <ReportCard
          title="General Info"
          content={
            <div>
              <Typography component="p">
                <b>ID:</b> {report.id}
              </Typography>
              <Typography component="p">
                <b>Start Date:</b> {report.startDate}
              </Typography>
              <Typography component="p">
                <b>End Date:</b> {report.endDate}
              </Typography>
              <Typography component="p">
                <b>Weeks:</b> {report.details.length}
              </Typography>

              <br />
              <Typography component="p">
                <b>Billable Time:</b> {formatMinutes(billableTime)}
              </Typography>
              <Typography component="p">
                <b>Total Time:</b> {formatMinutes(totalTime)}
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
                    <b>Start Date:</b> {detail.startDate}
                  </Typography>
                  <Typography component="p">
                    <b>End Date:</b> {detail.endDate}
                  </Typography>
                  <br />
                  <Typography component="p">
                    <b>Customers:</b>{" "}
                    {detail.customers.length > 0
                      ? detail.customers.map((cust) => cust.customer).join(", ")
                      : "N/A"}
                  </Typography>
                  <br />
                  <Typography component="p">
                    <b>Billable Time:</b>{" "}
                    {formatMinutes(weeklyTimes[week - 2].billable)}
                  </Typography>
                  <Typography component="p">
                    <b>Total Time:</b>{" "}
                    {formatMinutes(weeklyTimes[week - 2].all)}
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
