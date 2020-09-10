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
import Tags from "./tags";
import Post from "./post";
import Tag from "./tag";
import UserPost from "./user-post";
import Home from "./home";
import PrivateRoute from "./private_route";
import Header from "./header";
import Explore from "./explore";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <Router>
        <Header />
        <Switch>
          <Route path="/login">
            <Login />
          </Route>
          <PrivateRoute path="/upload" component={VideoUpload} />
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
          <PrivateRoute path="/tags" component={Tags} />
          <Route path="/tag/:id">
            <Tag />
          </Route>
          <PrivateRoute path="/posts" component={Explore} />
          <Route path="/post/:id">
            <Post />
          </Route>
          <PrivateRoute path="/userPosts" component={UserPost} />
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
    </Provider>
  );
};

export default App;
