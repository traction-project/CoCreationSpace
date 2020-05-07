import * as React from "react";
import { Route, HashRouter as Router, Switch } from "react-router-dom";

interface AppProps {
}

const App: React.FC<AppProps> = () => {
  return (
    <Router>
      <Switch>
        <Route path="/">
          Hello World!
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
