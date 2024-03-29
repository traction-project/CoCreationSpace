import * as React from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
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
  const { register, watch, handleSubmit, resetField, setFocus } = useForm();
  const { t } = useTranslation();

  if (props.login.user) {
    return (
      <Navigate to="/" />
    );
  }

  const onSubmit = handleSubmit(({ username, password }) => {
    props.loginActions.performLogin(username, password);

    resetField("password");
    setFocus("password");
  });

  const submitDisabled = (watch("username") || "").length == 0 || (watch("password") || "").length == 0;

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body opera-background">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6-tablet is-5-desktop is-5-widescreen">
              <form onSubmit={onSubmit} className="box">
                {props.login.loginError && (
                  <article className="message is-danger">
                    <div className="message-body">
                      <Trans i18nKey="login-error">
                        <strong>Login failed!</strong> Username or password are incorrect.
                      </Trans>
                    </div>
                  </article>
                )}

                <div className="field">
                  <label htmlFor="" className="label">{t("Username")}</label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      placeholder={t("Username")}
                      className="input"
                      required={true}
                      {...register("username")}
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-user" />
                    </span>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="" className="label">{t("Password")}</label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      placeholder={t("Password")}
                      className="input"
                      required={true}
                      {...register("password")}
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-lock"></i>
                    </span>
                  </div>
                </div>
                <div className="field" style={{ display: "flex", justifyContent: "space-between" }}>
                  <button type="submit" disabled={submitDisabled} className="button is-info">
                    {t("Login")}
                  </button>

                  <p>
                    <Link to="/requestreset">Forgot password?</Link>
                  </p>
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
