import React from 'react';
import {
  withStyles,
  Card,
  CardContent,
  CardActions,
  Modal,
  Button,
  TextField,
  FormControlLabel,
  Switch
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { Form, Field } from 'react-final-form';

const styles = theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '90%',
    maxWidth: 500,
  },
  modalCardContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  marginTop: {
    marginTop: theme.spacing(2),
  },
});


const TimeEditor = ({ classes, post, customers, serviceItems, onSave, history }) => (
  <Form initialValues={post} onSubmit={onSave}>
    {({ handleSubmit }) => (
      <Modal
        className={classes.modal}
        onClose={() => history.goBack()}
        open
      >
        <Card className={classes.modalCard}>
          <form onSubmit={handleSubmit}>
            <CardContent className={classes.modalCardContent}>
              <Autocomplete
                    // value={input.value}
                    renderOption={(option) => `${option}`}
                    id="customer"
                    freeSolo
                    options={customers}
                    renderInput={(params) =>(
                        <TextField label="Customer" autoFocus {...params}/>
                    )} />



              {/* <Field name="customer">
                {({ input }) => <TextField label="Customer" {...input} />}
              </Field>  */}
              <Field name="serviceItem">
                {({input}) => <Autocomplete 
                  id="serviceItem"
                  freeSolo
                  options={serviceItems}
                  renderInput={(params) => (
                    <TextField label="serviceItem" {...params} />
                  )}
                  {...input}
                />}
              </Field>
              
              {/* <Field name="serviceItem">
                {({ input }) => <TextField label="Service Item" {...input} />}
              </Field> */}
              <Field name="minutes" defaultValue={0}>
                {({ input }) => <TextField label="Minutes" type="number" {...input} />}
              </Field>
              <Field name="notes">
                {({ input }) => (
                  <TextField
                    className={classes.marginTop}
                    label="Notes"
                    multiline
                    rows={4}
                    {...input}
                  />
                )}
              </Field>
              <Field name="day" defaultValue={new Date().toISOString().split("T")[0]}>
                {({input}) => (
                  <TextField
                    id="day"
                    label="Date"
                    type="date"
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    {...input}
                  />
                )}
              </Field>
              <Field name="billable" type="checkbox" defaultValue={true}>
                {({ input }) => <FormControlLabel control={<Switch
                    checked={input.value}
                    name="billable"
                    color="primary"
                    />} 
                  label="Billable" {...input}/>}
              </Field>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary" type="submit">Save</Button>
              <Button size="small" onClick={() => history.goBack()}>Cancel</Button>
            </CardActions>
          </form>
        </Card>
      </Modal>
    )}
  </Form>
);

export default compose(
  withRouter,
  withStyles(styles),
)(TimeEditor);