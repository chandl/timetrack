import React, { Component, Fragment } from "react";
import { withRouter, Route, Redirect, Link } from "react-router-dom";


import ErrorSnackbar from "../components/ErrorSnackbar";


const styles = theme => ({
posts: {
    marginTop: theme.spacing(2),
},
fab: {
    position: 'absolute',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    },
},
});

const API = process.env.REACT_APP_API || 'http://localhost:3000';

class ReportManager extends Component {
    state = {
        loading: true,
        reports: [], 
        error: null
    }

    componentDidMount() {
        this.getReports();
    }

    async fetch(method, endpoint, body) {
        try {
          const response = await fetch(`${API}${endpoint}`, {
            method,
            body: body && JSON.stringify(body),
            headers: {
              "content-type": "application/json",
              accept: "application/json",
            },
          });
          const text = await response.text();
          if (text.length === 0 && response.ok) {
            return null;
          }
          if (!response.ok) {
            throw new Error(
              `Failed to Save Post; Error=${text}; Status=${response.statusText}. Send this error to chandler so he can fix 😎`
            );
          }
          return JSON.parse(text);
        } catch (error) {
          console.error(error);
          this.setState({ error });
        }
      }
}