import * as React from "react";
import { Provider } from "react-redux";
import { Route, HashRouter as Router, Switch } from "react-router-dom";

import store from "../store";

import Startup from "./startup";
import Login from "./login";
import Video from "./video";
import VideoUpload from "./video_upload";
import VideoStream from "./video_stream";
import VideoRecorder from "./video_recorder";
import Translate from "./translate";
import Post from "./post";
import Home from "./home";
import PrivateRoute from "./private_route";
import Header from "./header";
import PostList from "./post_list";
import Profile from "./profile";
import Signup from "./signup";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <Startup>
        <Router>
          <Header />
          <Switch>
            <Route path="/signup">
              <Signup />
            </Route>
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
            <PrivateRoute path="/posts" component={PostList} endpoint="/posts/all" />
            <Route path="/post/:id">
              <Post />
            </Route>
            <PrivateRoute path="/profile" component={Profile} />
            <PrivateRoute path="/userPosts" component={PostList} endpoint="/posts/all/user" />
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Router>
      </Startup>
    </Provider>
  );
};

export default App;
