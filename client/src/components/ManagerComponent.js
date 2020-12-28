import React, { Component, Fragment } from "react";


const API = process.env.REACT_APP_API || "http://localhost:3000";
const styles = (theme) => ({
    posts: {
      marginTop: theme.spacing(2),
    },
    fab: {
      position: "absolute",
      bottom: theme.spacing(3),
      right: theme.spacing(3),
      [theme.breakpoints.down("xs")]: {
        bottom: theme.spacing(2),
        right: theme.spacing(2),
      },
    },
  });

  // returns (response, error)
const Fetch = async (method, endpoint, body) => {
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
          return [null, null];
        }
        if (!response.ok) {
          throw new Error(
            `Encountered error making request to server; Error=${text}; Status=${response.statusText}. Send this error to chandler so he can fix 😎`
          );
        }
        return [JSON.parse(text), null];
      } catch (error) {
        console.error(error);
        return [null, error];
      }
}


export {Fetch};