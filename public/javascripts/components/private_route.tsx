import * as React from "react";
import { Route, Navigate } from "react-router-dom";
import store from "../store";

interface PrivateRouteProps {
  path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, path, ...rest }) => {
  const isLoggedIn = (): boolean => {
    return store.getState().login.loggedIn;
  };

  return (
    <Route path={path} {...rest} render={() => (
      isLoggedIn() ? (
        children
      ) : (
        <Navigate to="/login" />
      )
    )}></Route>
  );
};

export default PrivateRoute;
