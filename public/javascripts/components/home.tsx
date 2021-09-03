import * as React from "react";
import { useHistory, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";

import { ApplicationState } from "../store";
import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";
import LanguageSwitcher from "./language_switcher";

interface HomeActionProps {
  loginActions: LoginActions
}

interface HomeConnectedProps {
  login: LoginState;
}

type HomeProps = HomeActionProps & HomeConnectedProps;

const Home: React.FC<HomeProps> = (props) => {
  const { t } = useTranslation();
  const history = useHistory();

  const navigateTo = (destination: string) => {
    return () => {
      history.push(destination);
    };
  };

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body opera-background">
        <div className="container">
          <div className="columns is-centered is-mobile">
            <div className="column is-4-desktop is-6-tablet is-6-mobile">
              <figure className="image is-square no-border">
                <img src="/images/traction-logo-white-big.png"  />
              </figure>
            </div>
          </div>
          <div className="columns is-centered is-mobile">
            <div className="column is-5-desktop is-6-tablet is-10-mobile">
              {(props.login.loggedIn) ? (
                <ul className="home__menu">
                  <li className="home__menu-item" onClick={navigateTo("/userPosts")}>
                    {t("My Posts")}
                  </li>
                  <li className="home__menu-item" onClick={navigateTo("/posts")}>
                    {t("Explore")}
                  </li>
                  <li className="home__menu-item" onClick={navigateTo("/upload")}>
                    {t("Create")}
                  </li>
                </ul>
              ) : (
                <div className="box">
                  <h4 className="title is-4 has-text-centered">
                    {t("Welcome to the CoCreation Space!")}
                  </h4>

                  <div className="columns is-centered is-mobile">
                    <div className="column">
                      <Link className="button navbar-item is-info" to={"/login"}>{t("Sign In")}</Link>
                    </div>
                    <div className="column">
                      <Link className="button navbar-item is-light" to={"/signup"}>{t("Sign Up")}</Link>
                    </div>
                  </div>

                  <div className="has-children-centered">
                    <LanguageSwitcher />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function mapStateToProps(state: ApplicationState): HomeConnectedProps {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loginActions: bindActionCreators(loginActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
