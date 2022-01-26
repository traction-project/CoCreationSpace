import * as React from "react";
import { Dispatch } from "redux";
import { connect } from "react-redux";
import { ThemeProvider } from "styled-components";

import { ApplicationState } from "../store";
import { LoginState } from "../reducers/login";
import { themes } from "../themes";

interface ConnectedThemeProviderActionProps {
}

interface ConnectedThemeProviderConnectedProps {
  login: LoginState;
}

type ConnectedThemeProviderProps = ConnectedThemeProviderActionProps & ConnectedThemeProviderConnectedProps;

const ConnectedThemeProvider: React.FC<ConnectedThemeProviderProps> = ({ login, children }) => {
  const themeName = login.user?.theme;
  const theme = themes.data[themeName || "default"];

  return (
    <ThemeProvider theme={theme || themes.data.default}>
      {children}
    </ThemeProvider>
  );
};

function mapStateToProps(state: ApplicationState): ConnectedThemeProviderConnectedProps {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedThemeProvider);
