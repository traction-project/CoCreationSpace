import * as React from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";
import { ApplicationState } from "../store";

interface LoginActionProps {
  loginActions: LoginActions;
}

interface LoginConnectedProps {
  login: LoginState;
}

type LoginProps = LoginActionProps & LoginConnectedProps;

const Login: React.FC<LoginProps> = (props) => {
  const { register, watch, handleSubmit } = useForm();
  const { t } = useTranslation();
  const history = useHistory();

  const onSubmit = handleSubmit(({ username, password }) => {
    props.loginActions.performLogin(username, password, () => {
      history.push("/");
    });
  });

  const submitDisabled = (watch("username") || "").length == 0 || (watch("password") || "").length == 0;

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6-tablet is-5-desktop is-5-widescreen">
              <form onSubmit={onSubmit} className="box">
                <div className="field">
                  <label htmlFor="" className="label">{t("Username")}</label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      placeholder={t("Username")}
                      name="username"
                      className="input"
                      required={true}
                      ref={register}
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-envelope" />
                    </span>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="" className="label">{t("Password")}</label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      placeholder={t("Password")}
                      name="password"
                      className="input"
                      required={true}
                      ref={register}
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-lock"></i>
                    </span>
                  </div>
                </div>
                <div className="field">
                  <button type="submit" disabled={submitDisabled} className="button is-info">
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function mapStateToProps(state: ApplicationState): LoginConnectedProps {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loginActions: bindActionCreators(loginActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
