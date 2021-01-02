import {
  Paper,
  Typography,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  Accordion,
  AccordionSummary,
} from "@material-ui/core";
import {
  roundMinutesToNearestFifteen,
  formatMinutes,
} from "./ManagerComponent";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const getWeekday = (dayNumber) => dayNames[dayNumber];

const getDayFromDate = (date) => {
  return date.toISOString().split("T")[0];
};

export const WeeklyTimeList = ({ week }) => {
  const weekdays = [];

  // {
  //     dayDate,
  //     dayName,
  //     totalTime,
  //     times: []
  // }

  // request to backend:
  //  /report/preview/:id

  // {
  //   startDate,
  //   endDate
  // }

  const endDay = new Date(week.endDate);
  let day = new Date(week.startDate);
  while (day.getUTCDay() <= 5 && day <= endDay) {
    if (day.getUTCDay() >= 1) {
      weekdays.push({
        dayDate: getDayFromDate(day),
        dayName: getWeekday(day.getUTCDay()),
        totalTime: 0,
        times: [],
      });
    }
    day.setDate(day.getDate() + 1);
  }

  let currWeekday = 0;
  week.customers.forEach((cust) => {
    cust.times.forEach((time) => {
      // go to next day if 8 hours have been logged for one day
      if (
        weekdays[currWeekday].totalTime >= 480 &&
        currWeekday < weekdays.length - 1
      ) {
        currWeekday += 1;
      }

      const roundedMinutes = roundMinutesToNearestFifteen(time.minutes);
      time.minutes = roundedMinutes;
      weekdays[currWeekday].totalTime += time.minutes;
      weekdays[currWeekday].times.push(time);
    });
  });

  return weekdays
    .filter((day) => day.totalTime > 0)
    .map((day) => {
      return (
        <div>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {day.dayName} {day.dayDate}{" "}
              </Typography>
            </AccordionSummary>

            <TableContainer component={Paper}>
              <Table aria-label={day.dayName}>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>SvcItem</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Notes</TableCell>
                    <TableCell>Billable</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {day.times.map((time) => {
                    return (
                      <TableRow>
                        <TableCell>{time.customer}</TableCell>
                        <TableCell>{time.serviceItem}</TableCell>
                        <TableCell>{formatMinutes(time.minutes)}</TableCell>
                        <TableCell>{time.notes}</TableCell>
                        <TableCell>{time.billable ? "Yes" : "No"}</TableCell>
                      </TableRow>
                    );
                  })}

                  <TableRow>
                    <TableCell>
                      <b>TOTAL</b>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell>{formatMinutes(day.totalTime)}</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Accordion>
        </div>
      );
    });
};
