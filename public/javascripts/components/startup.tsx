import * as React from "react";
import { useEffect, useState } from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";

import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";
import { ApplicationState } from "../store";
import { verifyLoginStatus } from "../util";

interface StartupActionProps {
  loginActions: LoginActions;
}

interface StartupConnectedProps {
  login: LoginState;
}

type StartupProps = StartupActionProps & StartupConnectedProps;

const Startup: React.FC<StartupProps> = (props) => {
  const [ appInitialised, setAppInitialised ] = useState(false);

  useEffect(() => {
    verifyLoginStatus().then((loginStatus) => {
      if (loginStatus == props.login.loggedIn) {
        setAppInitialised(true);
        return;
      }

      if (loginStatus == true) {
        fetch("/users/profile").then((res) => {
          return res.json();
        }).then(({ id, username, image }) => {
          props.loginActions.setLoggedInUser(id, username, image);
          setAppInitialised(true);
        });
      } else {
        props.loginActions.clearLoggedInUser();
        setAppInitialised(true);
      }
    });
  }, []);

  return (
    (appInitialised) ? (
      <>{props.children}</>
    ) : (
      <p>Loading...</p>
    )
  );
};

function mapStateToProps(state: ApplicationState): StartupConnectedProps {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loginActions: bindActionCreators(loginActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Startup);
