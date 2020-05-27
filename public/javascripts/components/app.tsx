import * as React from "react";
import { Provider } from "react-redux";
import { Route, HashRouter as Router, Switch } from "react-router-dom";

import store from "../store";

import Login from "./login";
import Video from "./video";
import VideoUpload from "./video_upload";

interface AppProps {
}

const App: React.FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/upload">
            <VideoUpload />
          </Route>
          <Route path="/video/:id">
            <Video />
          </Route>
          <Route path="/">
            Hello World!
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
};

export default App;
