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
  withStyles,
} from "@material-ui/core";
import ErrorSnackbar from "./ErrorSnackbar";

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
  stepperContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

const StepperModal = ({ classes, steps, onSave, onClose }) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [error, setError] = React.useState();

  const totalSteps = steps.length;
  const isLastStep = () => activeStep === totalSteps - 1;
  const handleNext = () => {
    const currStep = steps[activeStep];
    currStep
      .validate()
      .then(() => currStep.complete())
      .then(() => (isLastStep() ? onSave() : setActiveStep(activeStep + 1)))
      .catch((err) => setError(err.message));
  };
  const changeStep = (step) => () => setActiveStep(step);
  return (
    <Modal className={classes.modal} onClose={onClose} open>
      <Card className={classes.modalCard}>
        <CardContent className={classes.modalCardContent}>
          <Stepper nonLinear activeStep={activeStep}>
            {steps.map((step, index) => (
              <Step key={step.name}>
                <StepButton onClick={changeStep(index)} disabled={true}>
                  {step.name}
                </StepButton>
              </Step>
            ))}
          </Stepper>
          <div>
            <div className={classes.stepperContent}>
              {steps[activeStep].content}
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

export default compose(withRouter, withStyles(styles))(StepperModal);
