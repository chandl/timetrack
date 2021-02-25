import React from "react";
import {
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  TextField,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import ErrorSnackbar from "./ErrorSnackbar";

import { compose } from "recompose";
import { withRouter } from "react-router-dom";
import { Formik, Form, Field } from "formik";

const styles = (theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "90%",
    maxWidth: 500,
  },
  modalCardContent: {
    display: "flex",
    flexDirection: "column",
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
});


const TimeEditor = ({
  classes,
  post,
  customers,
  serviceItems,
  onSave,
  history,
  lockedDown,
  onCancel
}) => {
  const [error, setError] = React.useState(null);

  const onClose = () => {
    if(onCancel) {
      onCancel();
    } else {
      history.goBack();
    }
  }

  let charCount = post.notes ? post.notes.length : 0;
  const setNotesLenError = () => {
    setError(`Notes must be 80 characters or less. (${charCount}/80)`);
  }

  return <div>(
    <Formik initialValues={{ ...post }} onSubmit={(data) => {
      if(charCount <= 80) {
        onSave(data);  
      } else {
        setNotesLenError();
      }
    }}>
      {({ setFieldValue, values, handleChange }) => (
        <Modal className={classes.modal} onClose={() => onClose()} open>
          <Card className={classes.modalCard}>
            <Form>
              <CardContent className={classes.modalCardContent}>
                <Autocomplete
                  id="customer"
                  type="text"
                  required={!lockedDown}
                  disabled={lockedDown}
                  onChange={(e, value) => setFieldValue("customer", value)}
                  defaultValue={values.customer}
                  freeSolo
                  autoSelect
                  options={customers}
                  renderInput={(params) => (
                    <TextField
                      required
                      autoFocus
                      label="Customer"
                      {...params}
                    />
                  )}
                />

                <Autocomplete
                  id="serviceItem"
                  required={!lockedDown}
                  disabled={lockedDown}
                  type="text"
                  onChange={(e, value) => setFieldValue("serviceItem", value)}
                  defaultValue={values.serviceItem}
                  freeSolo
                  autoSelect
                  options={serviceItems}
                  renderInput={(params) => (
                    <TextField required label="Service Item" {...params} />
                  )}
                />
                <Field
                  component={TextField}
                  required
                  id="minutes"
                  name="minutes"
                  label="Minutes"
                  type="number"
                  defaultValue={values.minutes}
                  onChange={handleChange}
                />

                <Field
                  component={TextField}
                  required
                  id="notes"
                  name="notes"
                  label={`Notes (${charCount}/80)`}
                  defaultValue={values.notes}
                  multiline
                  rows={4}
                  onChange={handleChange}
                  validate={(value) => {
                    const len = value.length
                    charCount = value.length;
                    if(len > 80) {
                      setNotesLenError();
                    }
                  }}
                />

                <Field
                  component={TextField}
                  required
                  id="day"
                  name="day"
                  label="Day"
                  type="date"
                  className={classes.textField}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleChange}
                  defaultValue={values.day}
                />
                <Field
                  name="billable"
                  id="billable"
                  label="Billable"
                  type="checkbox"
                  // defaultValue={true}
                  onChange={handleChange}
                  control={
                    <Switch
                      checked={values.billable}
                      name="billable"
                      color="primary"
                    />
                  }
                  component={FormControlLabel}
                />
              </CardContent>

              <CardActions>
                <Button size="small" color="primary" type="submit">
                  Save
                </Button>
                <Button size="small" onClick={() => {
                  onClose()
                }}>
                  Cancel
                </Button>
              </CardActions>
            </Form>
            {error && (
              <ErrorSnackbar onClose={() => setError(null)} message={error} />
            )}
          </Card>
        </Modal>
      )}
    </Formik>
  )
  
  </div>;
};

export default compose(withRouter, withStyles(styles))(TimeEditor);
