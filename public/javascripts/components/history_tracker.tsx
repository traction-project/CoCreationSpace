import * as React from "react";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { connect } from "react-redux";

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
  const history = useHistory();

  useEffect(() => {
    const removeListener = history.listen((location, action) => {
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
            action
          }
        })
      });
    });

    return () => {
      removeListener();
    };
  }, [login.loggedIn]);

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