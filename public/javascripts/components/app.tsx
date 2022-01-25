import * as React from "react";
import { Provider } from "react-redux";
import { Route, HashRouter as Router, Routes } from "react-router-dom";

import store from "../store";
import { actionCreators as loginActionCreators } from "../actions/login";
import { verifyLoginStatus } from "../util";

import Startup from "./startup";
import Login from "./login";
import CreatePost from "./post/create_post";
import Post from "./post/post";
import PrivateRoute from "./private_route";
import Header from "./header";
import PostList from "./post_list/post_list";
import Profile from "./profile";
import Signup from "./signup/signup";
import NotificationList from "./notifications/notification_list";
import CookieBanner from "./cookie_banner";
import EditPost from "./post/edit_post";
import HistoryTracker from "./history_tracker";
import RequestReset from "./request_reset";
import ResetPassword from "./reset_password";
import PublicProfile from "./public_profile";
import NotesList from "./notes/notes_list";
import NoteEntry from "./notes/note_entry";
import GlobalStyles from "../global_styles";

async function checkLogin() {
  const loginStatus = await verifyLoginStatus();
  const { loggedIn } = store.getState().login;

  if (loginStatus == loggedIn) {
    return;
  }

  if (loginStatus == true) {
    const res = await fetch("/users/profile");
    const { id, username, image, admin, email } = await res.json();

    store.dispatch(loginActionCreators.setLoggedInUser(id, username, image, admin, email));
  } else {
    store.dispatch(loginActionCreators.clearLoggedInUser());
  }
}

interface AppProps {}

const App: React.FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <Startup condition={checkLogin}>
        <GlobalStyles />
        <Router>
          <Header />
          <HistoryTracker endpoint="/internalnavigation">
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/requestreset" element={<RequestReset />} />
              <Route path="/resetpassword/:resettoken" element={<ResetPassword />} />
              <Route element={<PrivateRoute />}>
                <Route path="/upload" element={<CreatePost />} />
                <Route path="/notifications" element={<NotificationList />} />
                <Route path="/post/:id/edit" element={<EditPost />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/profile/:id" element={<PublicProfile />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/userPosts" element={<PostList endpoint="/posts/all/user" />} />
                <Route path="/drafts" element={<PostList endpoint="/posts/draft/user" />} />
                <Route path="/notes" element={<NotesList />} />
                <Route path="/note/:id" element={<NoteEntry />} />
                <Route path="/" element={<PostList endpoint="/posts/all/group" />} />
              </Route>
            </Routes>
          </HistoryTracker>
        </Router>
        <CookieBanner />
      </Startup>
    </Provider>
  );
};

export default App;
