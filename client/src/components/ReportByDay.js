import { Typography } from "@material-ui/core";
import ReportCustomerTabs from "./ReportCustomerTabs";
import { WeeklyTimeList } from "./WeeklyTimeList";

export const ReportByDay = ({ weeks }) => {
  let index = 0;

  const tabs = weeks.map((week) => {
    const startDay = getDayFromDate(new Date(week.startDate));
    const endDay = getDayFromDate(new Date(week.endDate));
    return {
      index: index++,
      label: `Week ${index} (${startDay} - ${endDay})`,
      content: (
        <div style={{ height: "65vh", overflowY: "scroll" }}>
          <WeeklyTimeList week={week} />
        </div>
      ),
    };
  });

  return (
    <div style={{ width: "100%" }}>
      <Typography variant="h5">Final Weekly Review</Typography>
      <p>
        Times for the entire week have been organized by customer and then split
        between each weekday. Each weekday should be near eight hours. Any
        leftover time will be added to the last weekday. If you are satisfied
        with this report, Click 'Finish' to generate a script that will automate
        report entry in your time tracker.
      </p>
      <ReportCustomerTabs customerTabs={tabs} />
    </div>
  );
};

const getDayFromDate = (date) => {
  const day = date.getUTCDate();
  const month = date.getUTCMonth() + 1;
  return `${month}/${day}`;
};
