import * as React from "react";
import { useState } from "react";
import { Dispatch, bindActionCreators } from "redux";
import { Link, useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import classnames from "classnames";

import { ApplicationState } from "../store";
import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";
import NotificationCounter from "./notification_counter";

interface HeaderActionProps {
  loginActions: LoginActions
}

interface HeaderConnectedProps {
  login: LoginState;
}

type HeaderProps = HeaderActionProps & HeaderConnectedProps;

const Header: React.FC<HeaderProps> = (props) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const [ burgerActive, setBurgerActive ] = useState(false);

  const logOut = () => {
    props.loginActions.performLogout();
    history.push("/");
  };

  const onBurgerClicked = () => {
    setBurgerActive(!burgerActive);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          <img src="/images/header-logo.png" alt="traction-logo" />
        </a>

        <a
          role="button"
          onClick={onBurgerClicked}
          className={classnames("navbar-burger", "burger", { "is-active": burgerActive })}
          aria-label="menu"
          aria-expanded="false"
          data-target="mainNavbar"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div id="mainNavbar" className={classnames("navbar-menu", { "is-active": burgerActive })}>
        <div className="navbar-start">
          <Link
            className={classnames("navbar-item", { "is-active": location.pathname == "/" })}
            to={"/"}
          >
            {t("Home")}
          </Link>
          <Link
            className={classnames("navbar-item", { "is-active": location.pathname == "/userPosts" })}
            to={"/userPosts"}>
            {t("My Posts")}
          </Link>
          <Link
            className={classnames("navbar-item", { "is-active": location.pathname == "/posts" })}
            to={"/posts"}>
            {t("Explore")}
          </Link>
        </div>

        <div className="navbar-end">
          {(props.login.loggedIn && props.login.user) ? (
            <>
              <Link to="/notifications" className="navbar-item">
                <NotificationCounter userId={props.login.user.id} />
              </Link>

              <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link">
                  <figure className="image is-32x32">
                    <img className="is-rounded" src={props.login.user.image} alt="User profile picture"/>
                  </figure>
                </a>
                <div className="navbar-dropdown is-right">
                  <Link className="navbar-item" to="/profile">{t("Profile")}</Link>
                  <hr className="navbar-divider" />
                  <a className="navbar-item" onClick={logOut}>{t("Sign Out")}</a>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-item">
              <div className="buttons">
                <Link className="button navbar-item is-info" to={"/login"}>{t("Sign In")}</Link>
                <Link className="button navbar-item is-light" to={"/signup"}>{t("Sign Up")}</Link>
              </div>
            </div>
          )}
        </div>
      </div>
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
