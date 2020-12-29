import React from "react";
import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Modal,
  Step,
  StepButton,
  Stepper,
  TextField,
  withStyles,
} from "@material-ui/core";
import ErrorSnackbar from "./ErrorSnackbar";
import { Fetch } from "./ManagerComponent";

const styles = (theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "90%",
    // maxWidth: 500,
  },
  modalCardContent: {
    display: "flex",
    flexDirection: "column",
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  stepperContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const DateRangePicker = ({ classes, report }) => {
  return (
    <div>
      <form className={classes.container} noValidate>
        <TextField
          id="startDate"
          label="Start Date"
          type="date"
          className={classes.textField}
          defaultValue={report.startDate}
          onChange={(e) => {
            report.startDate = e.target.value;
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <TextField
          id="endDate"
          label="End Date"
          type="date"
          className={classes.textField}
          defaultValue={report.endDate}
          onChange={(e) => {
            report.endDate = e.target.value;
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </form>
    </div>
  );
};

const validateReportDateRange = (report) => {
  const errors = [];
  if (!report.startDate) {
    errors.push("Start date must be selected");
  }
  if (!report.endDate) {
    errors.push("End date must be selected");
  }
  if (report.startDate && report.endDate && report.startDate > report.endDate) {
    errors.push("Start date must be before end date");
  }
  if (errors.length > 0) {
    return Promise.reject(new Error(errors.join(", ") + "."));
  }

  return Promise.resolve();
};

const createReport = (report) => {
  return Fetch("post", "/report", report)
    .then((res) => res)
    .catch((err) => {
      throw new Error(err);
    });
};

const ReportCreator = ({ classes, report, onSave, history }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [error, setError] = React.useState();

  const STEPS = [
    {
      name: "Select Report Date Range",
      content: <DateRangePicker classes={classes} report={report} />,
      validate: () => validateReportDateRange(report),
      complete: () =>
        createReport(report).then((res) => Object.assign(report, res)),
    },
    {
      name: "Confirm Report",
      content: <p>{JSON.stringify(report)}</p>,
      validate: () => Promise.resolve(),
      complete: () => Promise.resolve(),
    },
  ];

  const totalSteps = STEPS.length;
  const isLastStep = () => activeStep === totalSteps - 1;
  const handleNext = () => {
    const currStep = STEPS[activeStep];
    currStep
      .validate()
      .then(() => currStep.complete())
      .then(() =>
        isLastStep() ? handleFinish() : setActiveStep(activeStep + 1)
      )
      .catch((err) => setError(err.message));
  };
  const handleFinish = () => {
    console.log("HANDLE FINISH!!");
    onSave(report);
  };
  const changeStep = (step) => () => setActiveStep(step);
  return (
    <Modal className={classes.modal} onClose={() => history.goBack()} open>
      <Card className={classes.modalCard}>
        <CardContent className={classes.modalCardContent}>
          <Stepper nonLinear activeStep={activeStep}>
            {STEPS.map((step, index) => (
              <Step key={step.name}>
                <StepButton onClick={changeStep(index)} disabled={true}>
                  {step.name}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          <div>
            <div className={classes.stepperContent}>
              {STEPS[activeStep].content}
              {error && (
                <ErrorSnackbar onClose={() => setError(null)} message={error} />
              )}
            </div>
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                className={classes.button}
              >
                {activeStep === totalSteps - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
};

export default compose(withRouter, withStyles(styles))(ReportCreator);
