import * as React from "react";
import { useState } from "react";
import { Dispatch, bindActionCreators } from "redux";

import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";
import { ApplicationState } from "../store";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";

interface LoginActionProps {
  loginActions: LoginActions;
}

interface LoginConnectedProps {
  login: LoginState;
}

type LoginProps = LoginActionProps & LoginConnectedProps;

const Login: React.FC<LoginProps> = (props) => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const { user } = await response.json();

      props.loginActions.setLoggedInUser(
        user.id,
        user.username,
        user.image
      );
      history.push("/");
    }
  };

  return (
    <div className="columns">
      <div className="box column is-one-third is-offset-one-third" style={{ marginTop: "20vh" }}>
        <div>
          <div className="field">
            <label className="label">Username</label>
            <div className="control">
              <input className="input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label className="label">Password</label>
            <div className="control">
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <div className="control">
              <button
                className="button is-info"
                disabled={username.length === 0 || password.length === 0}
                onClick={onSubmit}
              >
                Login
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
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
