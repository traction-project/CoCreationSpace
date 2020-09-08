import * as React from "react";
import { Route, Redirect } from "react-router-dom";
import store from "../store";

interface PrivateRouteProps {
    component: React.FC;
    path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, path }) => {

  const isLoggedIn = (): boolean => {
    return store.getState().login.loggedIn;
  };

  return (
    <Route path={path} render={(props) => (
      isLoggedIn() 
        ? <Component />
        : <Redirect to="/login" /> 
    )}></Route>
  );
};

export default PrivateRoute;