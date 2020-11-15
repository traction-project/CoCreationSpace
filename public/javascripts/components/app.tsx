import * as React from "react";
import { Provider } from "react-redux";
import { Route, HashRouter as Router, Switch } from "react-router-dom";

import store from "../store";
import { actionCreators as loginActionCreators } from "../actions/login";
import { verifyLoginStatus } from "../util";

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
import Signup from "./signup/signup";
import NotificationList from "./notification_list";
import CookieBanner from "./cookie_banner";

async function checkLogin() {
  const loginStatus = await verifyLoginStatus();
  const { loggedIn } = store.getState().login;

  if (loginStatus == loggedIn) {
    return;
  }

  if (loginStatus == true) {
    const res = await fetch("/users/profile");
    const { id, username, image } = await res.json();

    store.dispatch(loginActionCreators.setLoggedInUser(id, username, image));
  } else {
    store.dispatch(loginActionCreators.clearLoggedInUser());
  }
}

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <Startup condition={checkLogin}>
        <Router>
          <Header />
          <Switch>
            <Route path="/signup">
              <Signup />
            </Route>
            <Route path="/login">
              <Login />
            </Route>
            <PrivateRoute path="/upload">
              <VideoUpload />
            </PrivateRoute>
            <Route path="/videos">
              <VideoStream />
            </Route>
            <Route path="/video/:id">
              <Video />
            </Route>
            <Route path="/notifications">
              <NotificationList />
            </Route>
            <PrivateRoute path="/record">
              <VideoRecorder />
            </PrivateRoute>
            <Route path="/translate/:id">
              <Translate />
            </Route>
            <PrivateRoute path="/posts">
              <PostList endpoint="/posts/all" />
            </PrivateRoute>
            <Route path="/post/:id">
              <Post />
            </Route>
            <PrivateRoute path="/profile">
              <Profile />
            </PrivateRoute>
            <PrivateRoute path="/userPosts">
              <PostList endpoint="/posts/all/user" />
            </PrivateRoute>
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Router>
        <CookieBanner />
      </Startup>
    </Provider>
  );
};

export default App;
