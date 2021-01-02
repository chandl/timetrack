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
import { formatMinutes } from "./ManagerComponent";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export const WeeklyTimeList = ({ week }) => {
  return week.formatted
    .filter((day) => day.totalTime > 0)
    .map((day) => {
      return (
        <div>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {day.dayName}, {day.dayDate}{" "}
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
