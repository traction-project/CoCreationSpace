import * as React from "react";
import { useState } from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";

import { actionCreators as loginActionCreators, LoginActions } from "../../actions/login";
import { LoginState } from "../../reducers/login";
import { ApplicationState } from "../../store";

import RegistrationForm from "./registration_form";

interface SignupActionProps {
  loginActions: LoginActions;
}

interface SignupConnectedProps {
  login: LoginState;
}

type SignupProps = SignupActionProps & SignupConnectedProps;

const Signup: React.FC<SignupProps> = (props) => {
  const [ step, setStep ] = useState(1);

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6-tablet is-5-desktop is-5-widescreen">
              {(step == 1) ? (
                <RegistrationForm
                  onComplete={(username, password) => {
                    props.loginActions.performLogin(username, password);
                    setStep(step + 1);
                  }}
                />
              ) : (
                <p>Next step</p>
              )}
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
