import * as React from "react";
import { useLocation, Link, useHistory } from "react-router-dom";
import { actionCreators } from "../actions/login";
import store from "../store";
import { useState, useEffect } from "react";
import { Unsubscribe } from "redux";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  const [ image, setImage ] = useState<string>();
  const [ loggedIn, setLoggedIn ] = useState<boolean>(false);
  const location = useLocation();
  const history = useHistory();
  let subscription: Unsubscribe;

  useEffect(() => {
    let { login } = store.getState();

    if (login) {
      setLoggedIn(login.loggedIn);
      if (login.user) {
        setImage(login.user?.image);
      }
    }
    if (!subscription) {
      subscription = store.subscribe(() => {
        const { login } = store.getState();

        if (login) {
          setLoggedIn(login.loggedIn);
          if (login.user) {
            setImage(login.user.image);
          }
        }
      });
    }
  }, []);

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
      { loggedIn
        ? <figure className="header__item dropdown-btn" style={{width: "min-content"}}>
          <span className="image is-48x48">
            <img src={image} alt="Logo"/>
          </span>
          <ul className="box dropdown">
            <Link to={"/profile"}><li className="dropdown__item">Profile</li></Link>
            <hr/>
            <li className="dropdown__item red" onClick={() => logOut()}>Sign Out</li>
          </ul>
        </figure>
        : <div>
          <Link to={"/login"}><span className="header__item">Sign In</span></Link>
          <Link to={"/signup"}><span className="header__item">Sign Up</span></Link>
        </div>
      }
    </nav>
  );
};

export default Header;