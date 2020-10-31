import * as React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";

import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import LanguageSwitcher from "./language_switcher";

interface SignupProps {
  loginActions: LoginActions;
}

const Signup: React.FC<SignupProps> = (props) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { handleSubmit, register, errors, watch } = useForm({});

  const handleButtonSubmitClick = handleSubmit(({ username, password, confirmation, languageCode }) => {
    fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, confirmation, languageCode })
    }).then(async (res) => {
      if (res.ok) {
        props.loginActions.performLogin(username, password, () => {
          history.push("/");
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  });

  return (
    <div className="columns" style={{ marginTop: "5rem" }}>
      <div className="column is-half is-offset-one-quarter">
        <div className="box box-flex" style={{ width: "max-content", margin: "0 auto", padding: "1rem 4rem"}}>
          <h1 className="title-box-1">
            <span>{t("Sign Up")}</span>
          </h1>

          <form onSubmit={handleButtonSubmitClick}>
            <div className="form-group">
              <div className="field">
                <label className="label">{t("Username")}</label>
                <div className="control">
                  <input
                    className="input-1"
                    type="text"
                    name="username"
                    ref={register({
                      required: true
                    })} />
                </div>
                { errors.username && <p className="help is-danger">* {t("required")}</p>}
              </div>
            </div>
            <div className="form-group">
              <div className="field">
                <label className="label">{t("Password")}</label>
                <div className="control">
                  <input
                    className="input-1"
                    name="password"
                    ref={register({
                      required: true
                    })}
                    type="password" />
                </div>
                { errors.password && <p className="help is-danger">* {t("required")}</p>}
              </div>
              <div className="field">
                <label className="label">{t("Confirm Password")}</label>
                <div className="control">
                  <input
                    className="input-1"
                    name="confirmation"
                    type="password"
                    ref={register({
                      validate: (value) => value === watch("password")
                    })}/>
                  { errors.confirmation && <p className="help is-danger">* {t("The passwords do not match")}</p>}
                </div>
              </div>
              <div className="field">
                <label className="label">{t("Select preferred language")}</label>
                <div className="control">
                  <LanguageSwitcher childName="languageCode" childRef={register()} />
                </div>
              </div>
            </div>
            <button className="btn">{t("Submit")}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loginActions: bindActionCreators(loginActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Signup);
