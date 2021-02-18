import * as React from "react";
import { Provider } from "react-redux";
import { Route, HashRouter as Router, Switch } from "react-router-dom";

import store from "../store";
import { actionCreators as loginActionCreators } from "../actions/login";
import { verifyLoginStatus } from "../util";

import Startup from "./startup";
import Login from "./login";
import VideoUpload from "./video_upload";
import Post from "./post/post";
import Home from "./home";
import PrivateRoute from "./private_route";
import Header from "./header";
import PostList from "./post_list/post_list";
import Profile from "./profile";
import Signup from "./signup/signup";
import NotificationList from "./notifications/notification_list";
import CookieBanner from "./cookie_banner";
import EditPost from "./edit_post";

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
            <Route path="/notifications">
              <NotificationList />
            </Route>
            <PrivateRoute path="/posts">
              <PostList endpoint="/posts/all/group" />
            </PrivateRoute>
            <PrivateRoute path="/post/:id/edit">
              <EditPost />
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
