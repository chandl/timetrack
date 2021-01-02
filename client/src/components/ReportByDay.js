import { Typography } from "@material-ui/core";
import ReportCustomerTabs from "./ReportCustomerTabs";
import { WeeklyTimeList } from "./WeeklyTimeList";

export const ReportByDay = ({ weeks }) => {
  let index = 0;

  const tabs = weeks.map((week) => {
    return {
      index: index++,
      label: "Week " + index,
      content: <WeeklyTimeList week={week} />,
    };
  });

  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h5">Final Weekly Review</Typography>
      <ReportCustomerTabs customerTabs={tabs} />
    </div>
  );
};
