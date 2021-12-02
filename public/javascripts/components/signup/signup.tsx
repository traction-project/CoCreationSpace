import * as React from "react";
import { useState } from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { actionCreators as loginActionCreators, LoginActions } from "../../actions/login";
import { LoginState } from "../../reducers/login";
import { ApplicationState } from "../../store";

import RegistrationForm from "./registration_form";
import ProfilePictureUploadForm from "./profile_picture_upload_form";
import InterestSelectForm from "./interest_select_form";
import JoinGroupForm from "./join_group_form";
import ConsentForm from "./consent_form";

interface SignupActionProps {
  loginActions: LoginActions;
}

interface SignupConnectedProps {
  login: LoginState;
}

type SignupProps = SignupActionProps & SignupConnectedProps;

const Signup: React.FC<SignupProps> = (props) => {
  const { login: { user } } = props;
  const { t } = useTranslation();
  const [ step, setStep ] = useState(1);

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body opera-background">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6-tablet is-5-desktop is-5-widescreen">
              <div className="box">
                {(step == 1) ? (
                  <>
                    <h4 className="title is-4">{t("Create Account")}</h4>

                    <RegistrationForm
                      onComplete={(username, password, image, admin, email) => {
                        props.loginActions.setLoggedInUser(username, password, image, admin, email);
                        setStep(step + 1);
                      }}
                    />
                  </>
                ) : (step == 2 && user) ? (
                  <>
                    <h4 className="title is-4">{t("Consent")}</h4>

                    <ConsentForm
                      onComplete={() => {
                        setStep(step + 1);
                      }}
                    />
                  </>
                ) : (step == 3 && user) ? (
                  <>
                    <h4 className="title is-4">{t("Upload Profile Picture")}</h4>

                    <ProfilePictureUploadForm
                      currentImage={user.image!}
                      skippable={true}
                      onComplete={(image) => {
                        props.loginActions.setLoggedInUser(
                          user.id, user.username, image, user.admin, user.email
                        );

                        setStep(step + 1);
                      }}
                    />
                  </>
                ) : (step == 4) ? (
                  <>
                    <h4 className="title is-4">{t("Select a group to join")}</h4>

                    <JoinGroupForm
                      multiSelect={false}
                      onComplete={() => {
                        setStep(step + 1);
                      }}
                    />
                  </>
                ) : (step == 5) ? (
                  <>
                    <h4 className="title is-4">{t("Select Interest Topics")}</h4>

                    <InterestSelectForm
                      onComplete={() => {
                        setStep(step + 1);
                      }}
                    />
                  </>
                ) : (
                  <Redirect to="/" />
                )}
              </div>
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
