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
