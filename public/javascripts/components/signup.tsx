import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";

import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";

interface SignupProps {
  loginActions: LoginActions;
}

const Signup: React.FC<SignupProps> = (props) => {
  const history = useHistory();
  const { handleSubmit, register, errors } = useForm({});
  const [ username, setUsername ] = useState<string>();
  const [ password, setPassword ] = useState<string>();

  const handleButtonSubmitClick = handleSubmit(({ username, password, confirmation }) => {
    fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({username, password, confirmation})
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

  const handleInputUsernameChange = (value: string) => {
    setUsername(value);
  };

  const handleInputPasswordChange = (value: string) => {
    setPassword(value);
  };

  return (
    <div className="columns" style={{ marginTop: "5rem" }}>
      <div className="column is-half is-offset-one-quarter">
        <div className="box box-flex" style={{ width: "max-content", margin: "0 auto", padding: "1rem 4rem"}}>
          <h1 className="title-box-1"><span>Sign Up</span></h1>
          <form onSubmit={handleButtonSubmitClick}>
            <div className="form-group">
              <div className="field">
                <label className="label">Username</label>
                <div className="control">
                  <input
                    className="input-1"
                    type="text"
                    name="username"
                    value={username || ""}
                    onChange={(e) => handleInputUsernameChange(e.currentTarget.value)}
                    ref={register({
                      required: true
                    })} />
                </div>
                { errors.username && <p className="help is-danger">* It is required</p>}
              </div>
            </div>
            <div className="form-group">
              <div className="field">
                <label className="label">New Password</label>
                <div className="control">
                  <input
                    className="input-1"
                    name="password"
                    onChange={(e) => handleInputPasswordChange(e.currentTarget.value)}
                    ref={register({
                      required: true
                    })}
                    type="password" />
                </div>
                { errors.password && <p className="help is-danger">* It is required</p>}
              </div>
              <div className="field">
                <label className="label">Confirm Password</label>
                <div className="control">
                  <input
                    className="input-1"
                    name="confirmation"
                    type="password"
                    ref={register({
                      validate: (value) => !password || value === password  || "The passwords do not match"
                    })}/>
                  { errors.confirmation && <p className="help is-danger">* {errors.confirmation.message}</p>}
                </div>
              </div>
            </div>
            <button className="btn">Submit</button>
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
