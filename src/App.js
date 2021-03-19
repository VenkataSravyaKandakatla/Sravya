import React, { Component } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import Meeting from "./Containers/Meeting";

const theme = createMuiTheme({
  typography: {
    fontFamily: ["Poppins", "sans-serif"].join(",")
  }
});

class Root extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <Switch>
          <Route exact path="/" component={Meeting} /> 
          </Switch>
        </BrowserRouter>
      </MuiThemeProvider>
    );
  }
}

export default Root;
