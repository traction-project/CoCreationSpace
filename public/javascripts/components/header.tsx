import * as React from "react";
import { useLocation, Link, useHistory } from "react-router-dom";
import store from "../store";
import { actionCreators } from "../actions/login";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();
  const history = useHistory();

  const isLoggedIn = (): boolean => {
    return store.getState().login.loggedIn;
  };

  const logOut = () => {
    store.dispatch(actionCreators.clearLoggedInUser());
    history.push("/");
  };

  return (
    <nav className="header">
      <h3 className="header__item header__logo">MediaVault</h3>
      <div className="menu-bar">
        <div className="menu-bar__item">
          <Link to={"/"}><span className={location.pathname === "/" ? "active" : ""}>Home</span></Link>
        </div>
        <div className="menu-bar__item">
          <Link to={"/userPosts"}><span className={location.pathname === "/userPosts" ? "active" : ""}>My Posts</span></Link>
        </div>
        <div className="menu-bar__item">
          <Link to={"/posts"}><span className={location.pathname === "/posts" ? "active" : ""}>Explore</span></Link>
        </div>
      </div>
      { isLoggedIn()
        ? <a className="header__item" onClick={logOut}>Sign Out</a>
        : <Link to={"/login"}><span className="header__item">Sign In</span></Link>  
      }
    </nav>
  );
};

export default Header;