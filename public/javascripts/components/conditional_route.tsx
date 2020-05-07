import * as React from "react";
import { RouteProps, Route, Redirect } from "react-router-dom";

interface ConditionalRouteProps extends RouteProps {
  enabled: boolean;
  redirect: string
}

const ConditionalRoute: React.FC<ConditionalRouteProps> = (props) => {
  const { children, redirect, enabled, ...rest } = props;

  return (
    <Route
      {...rest}
      render={(props) => {
        return (
          (enabled) ? (
            children
          ) : (
            <Redirect to={{ pathname: redirect, state: { from: props.location } }} />
          )
        );
      }}
    />
  );
};

export default ConditionalRoute;
