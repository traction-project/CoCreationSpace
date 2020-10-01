import * as React from "react";
import { Route, Redirect } from "react-router-dom";
import store from "../store";

interface PrivateRouteProps {
    component: React.FC;
    path: string;
    endpoint?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, path, ...rest }) => {

  const isLoggedIn = (): boolean => {
    return store.getState().login.loggedIn;
  };

  return (
    <Route path={path} {...rest} render={(props) => (
      isLoggedIn()
        ?  <Component {...rest}/>
        : <Redirect to="/login" />
    )}></Route>
  );
};

export default PrivateRoute;