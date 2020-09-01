import * as React from "react";
import { Provider } from "react-redux";
import { Route, HashRouter as Router, Switch } from "react-router-dom";

import store from "../store";

import Login from "./login";
import Video from "./video";
import VideoUpload from "./video_upload";
import VideoStream from "./video_stream";
import VideoRecorder from "./video_recorder";
import Translate from "./translate";
import Threads from "./threads";
import Post from "./post";

interface AppProps {}

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
          <Route path="/videos">
            <VideoStream />
          </Route>
          <Route path="/video/:id">
            <Video />
          </Route>
          <Route path="/record">
            <VideoRecorder />
          </Route>
          <Route path="/translate/:id">
            <Translate />
          </Route>
          <Route path="/threads">
            <Threads />
          </Route>
          <Route path="/post/:id">
            <Post />
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
