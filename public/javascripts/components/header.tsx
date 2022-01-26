import * as React from "react";
import { useEffect, useState } from "react";
import { Dispatch, bindActionCreators } from "redux";
import { Link, useNavigate } from "react-router-dom";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { ApplicationState } from "../store";
import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";
import NotificationCounter from "./notifications/notification_counter";
import HeaderLink from "./header_link";

interface HeaderActionProps {
  loginActions: LoginActions
}

interface HeaderConnectedProps {
  login: LoginState;
}

type HeaderProps = HeaderActionProps & HeaderConnectedProps;

const Header: React.FC<HeaderProps> = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ burgerActive, setBurgerActive ] = useState(false);

  useEffect(() => {
    if (props.login.loggedIn == false) {
      navigate("/login");
    }
  }, [props.login.loggedIn]);

  const logOut = () => {
    props.loginActions.performLogout();
  };

  const onBurgerClicked = () => {
    setBurgerActive(!burgerActive);
  };

  const onCollapsedNotificationIconClicked = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    navigate("/notifications");
  };

  return (
    <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <a className="navbar-item" href="/">
          <img src="/images/header-logo_greyscale.png" alt="traction-logo" />
        </a>

        <a
          role="button"
          onClick={onBurgerClicked}
          className={classNames("navbar-burger", "burger", { "is-active": burgerActive })}
          aria-label="menu"
          aria-expanded="false"
          data-target="mainNavbar"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />

          {(props.login.loggedIn && props.login.user) && (
            <div className="notification-count" onClick={onCollapsedNotificationIconClicked}>
              <NotificationCounter hideText={true} userId={props.login.user!.id} />
            </div>
          )}
        </a>
      </div>

      <div id="mainNavbar" className={classNames("navbar-menu", { "is-active": burgerActive })}>
        <div className="navbar-start">
          <HeaderLink
            onClick={() => setBurgerActive(false)}
            to={"/"}
          >
            {t("Explore")}
          </HeaderLink>
          <HeaderLink
            onClick={() => setBurgerActive(false)}
            to={"/userPosts"}
          >
            {t("My Posts")}
          </HeaderLink>
          <HeaderLink
            onClick={() => setBurgerActive(false)}
            to={"/notes"}
          >
            {t("My Favourites")}
          </HeaderLink>
          <HeaderLink
            onClick={() => setBurgerActive(false)}
            to={"/drafts"}
          >
            {t("Drafts")}
          </HeaderLink>
          <HeaderLink
            onClick={() => setBurgerActive(false)}
            to={"/upload"}
          >
            {t("Create Post")}
          </HeaderLink>
        </div>

        <div className="navbar-end">
          {(props.login.loggedIn && props.login.user) ? (
            <>
              <Link to="/notifications" className="navbar-item" onClick={() => setBurgerActive(false)}>
                <NotificationCounter userId={props.login.user.id} />
              </Link>

              <div className="navbar-item has-dropdown is-hoverable">
                <a className="navbar-link">
                  <figure className="image is-32x32">
                    <img className="is-rounded" src={props.login.user.image} alt="User profile picture"/>
                  </figure>
                </a>
                <div className="navbar-dropdown is-right">
                  <Link className="navbar-item" to="/profile" onClick={() => setBurgerActive(false)}>
                    {t("Profile")}
                  </Link>
                  <hr className="navbar-divider" />
                  <a className="navbar-item" onClick={logOut}>{t("Sign Out")}</a>
                </div>
              </div>
            </>
          ) : (
            <div className="navbar-item">
              <div className="buttons">
                <Link className="button navbar-item is-info" to={"/login"} onClick={() => setBurgerActive(false)}>
                  {t("Sign In")}
                </Link>
                <Link className="button navbar-item is-light" to={"/signup"} onClick={() => setBurgerActive(false)}>
                  {t("Sign Up")}
                </Link>
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
