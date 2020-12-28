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
// import { Form, Field } from 'react-final-form';
import { Formik, Form, Field } from "formik";


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

const TimeEditor = ({ classes, post, customers, serviceItems, onSave, history }) => {
  return (
      <Formik
        initialValues={{...post}}
        onSubmit={data => onSave(data)}>
        {({ setFieldValue, values, handleChange }) => (
        <Modal
        className={classes.modal}
        onClose={() => history.goBack()}
        open
        >    
        <Card className={classes.modalCard}>
          <Form>
          
            <CardContent className={classes.modalCardContent}>

              <Autocomplete 
                  id="customer"
                  type="text"
                  onChange={(e, value) => setFieldValue("customer", value)}
                  defaultValue={values.customer}
                  freeSolo
                  autoSelect
                  options={customers}
                  renderInput={(params) => (
                    <TextField required autoFocus label="Customer" {...params} />
                  )}
                />

            <Autocomplete 
                  id="serviceItem"
                  required
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
              onChange={handleChange}/>
              
            <Field 
              component={TextField}
              required
              id="notes"
              name="notes"
              label="Notes"
              defaultValue={values.notes} 
              multiline
              rows={4}
              onChange={handleChange}/>

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
              defaultValue={values.day} />
            <Field 
              name="billable"
              id="billable"
              label="Billable"
              type="checkbox"
              // defaultValue={true}
              onChange={handleChange}
              control={<Switch
                        checked={values.billable}
                        name="billable"
                        color="primary"
                        />} 
              component={FormControlLabel}/>
            </CardContent>

              <CardActions>
                <Button size="small" color="primary" type="submit">Save</Button>
                <Button size="small" onClick={() => history.goBack()}>Cancel</Button>
              </CardActions>
            </Form>
        </Card>
        </Modal>)}
      </Formik>


      

  );
}

export default compose(
  withRouter,
  withStyles(styles),
)(TimeEditor);