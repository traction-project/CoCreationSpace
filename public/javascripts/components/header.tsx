import * as React from "react";
import { Dispatch, bindActionCreators } from "redux";
import { useLocation, Link, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";

import { ApplicationState } from "../store";
import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";

interface HeaderActionProps {
  loginActions: LoginActions
}

interface HeaderConnectedProps {
  login: LoginState;
}

type HeaderProps = HeaderActionProps & HeaderConnectedProps;

const Header: React.FC<HeaderProps> = (props) => {
  const { t } = useTranslation();
  const location = useLocation();
  const history = useHistory();

  const logOut = () => {
    props.loginActions.performLogout();
    history.push("/");
  };

  return (
    <nav className="header">
      <h3 className="header__item header__logo">MediaVault</h3>
      <div className="menu-bar">
        <div className="menu-bar__item">
          <Link to={"/"}><span className={location.pathname === "/" ? "active" : ""}>{t("Home")}</span></Link>
        </div>
        <div className="menu-bar__item">
          <Link to={"/userPosts"}><span className={location.pathname === "/userPosts" ? "active" : ""}>{t("My Posts")}</span></Link>
        </div>
        <div className="menu-bar__item">
          <Link to={"/posts"}><span className={location.pathname === "/posts" ? "active" : ""}>{t("Explore")}</span></Link>
        </div>
      </div>
      {(props.login.loggedIn) ? (
        <figure className="header__item dropdown-btn" style={{width: "min-content"}}>
          <span className="image is-48x48">
            <img src={props.login.user?.image} alt="Logo"/>
          </span>
          <ul className="box dropdown">
            <Link to={"/profile"}><li className="dropdown__item">{t("Profile")}</li></Link>
            <hr/>
            <li className="dropdown__item red" onClick={() => logOut()}>{t("Sign Out")}</li>
          </ul>
        </figure>
      ) : (
        <div>
          <Link to={"/login"}><span className="header__item">{t("Sign In")}</span></Link>
          <Link to={"/signup"}><span className="header__item">{t("Sign Up")}</span></Link>
        </div>
      )}
    </nav>
  );
};

function mapStateToProps(state: ApplicationState): HeaderConnectedProps {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loginActions: bindActionCreators(loginActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
