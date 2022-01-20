import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router-dom";

import { ApplicationState } from "../store";
import { LoginState } from "../reducers/login";

interface HistoryTrackerConnectedProps {
  login: LoginState;
}

interface HistoryTrackerProps extends HistoryTrackerConnectedProps {
  endpoint: string;
  children?: React.ReactNode;
}

const HistoryTracker: React.FC<HistoryTrackerProps> = (props) => {
  const { children, endpoint, login } = props;
  const location = useLocation();

  useEffect(() => {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: login.user?.id,
        data: {
          path: location.pathname,
          search: location.search,
          hash: location.hash,
          state: location.state,
          action: "PUSH"
        }
      })
    });
  }, [login.loggedIn, location]);

  return (
    <>
      {children}
    </>
  );
};

function mapStateToProps(state: ApplicationState): HistoryTrackerConnectedProps {
  return {
    login: state.login
  };
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(HistoryTracker);
