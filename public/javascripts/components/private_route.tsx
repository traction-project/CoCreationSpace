import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";
import store from "../store";

interface PrivateRouteProps {
}

const PrivateRoute: React.FC<PrivateRouteProps> = () => {
  const isLoggedIn = (): boolean => {
    return store.getState().login.loggedIn;
  };

  if (isLoggedIn()) {
    return <Outlet/>;
  }

  return <Navigate to="/home" />;
};

export default PrivateRoute;
