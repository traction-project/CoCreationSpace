import * as React from "react";
import { useForm } from "react-hook-form";
import { Redirect } from "react-router-dom";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { useTranslation, Trans } from "react-i18next";

import { actionCreators as loginActionCreators, LoginActions } from "../../actions/login";
import { LoginState } from "../../reducers/login";
import { ApplicationState } from "../../store";

import LanguageSwitcher from "../language_switcher";

interface SignupActionProps {
  loginActions: LoginActions;
}

interface SignupConnectedProps {
  login: LoginState;
}

type SignupProps = SignupActionProps & SignupConnectedProps;

const Signup: React.FC<SignupProps> = (props) => {
  const { t } = useTranslation();
  const { handleSubmit, register, errors, watch } = useForm({});

  if (props.login.user) {
    return (
      <Redirect to="/" />
    );
  }

  const handleButtonSubmitClick = handleSubmit(async ({ username, password, preferredLanguage }) => {
    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, preferredLanguage })
      });

      if (res.ok) {
        props.loginActions.performLogin(username, password);
      } else {
        const data = await res.json();
        props.loginActions.setRegistrationError(data.message);
      }
    } catch (err) {
      console.log(err);
      props.loginActions.setRegistrationError(err);
    }
  });

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6-tablet is-5-desktop is-5-widescreen">
              <form onSubmit={handleButtonSubmitClick} className="box">
                {props.login.registrationError && (
                  <article className="message is-danger">
                    <div className="message-body">
                      {(props.login.registrationError == "Username exists") ? (
                        <Trans i18nKey="registration-error-username-exists">
                          <strong>Registration failed!</strong> Username already exists.
                        </Trans>
                      ) : (
                        <Trans i18nKey="registration-error-unknown">
                          <strong>Registration failed!</strong> An onknown error occurred.
                        </Trans>
                      )}
                    </div>
                  </article>
                )}

                <div className="field">
                  <label htmlFor="" className="label">{t("Username")}</label>
                  <div className="control has-icons-left">
                    <input
                      type="text"
                      placeholder={t("Username")}
                      name="username"
                      className="input"
                      required={true}
                      ref={register({
                        required: true
                      })}
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-envelope" />
                    </span>
                  </div>
                  {errors.username && <p className="help is-danger">{t("required")}</p>}
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
                      ref={register({
                        required: true
                      })}
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-lock"></i>
                    </span>
                  </div>
                  {errors.password && <p className="help is-danger">{t("required")}</p>}
                </div>

                <div className="field">
                  <label htmlFor="" className="label">{t("Confirm Password")}</label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      placeholder={t("Confirm Password")}
                      name="confirmation"
                      className="input"
                      required={true}
                      ref={register({
                        required: true,
                        validate: (value) => value == watch("password")
                      })}
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-lock"></i>
                    </span>
                  </div>
                  {errors.confirmation && <p className="help is-danger">{t("The passwords do not match")}</p>}
                </div>

                <div className="field">
                  <label className="label">{t("Preferred language")}</label>
                  <div className="control">
                    <LanguageSwitcher childName="preferredLanguage" childRef={register} />
                  </div>
                </div>

                <div className="field">
                  <button type="submit" className="button is-info">
                    {t("Submit")}
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

function mapStateToProps(state: ApplicationState) {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loginActions: bindActionCreators(loginActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
