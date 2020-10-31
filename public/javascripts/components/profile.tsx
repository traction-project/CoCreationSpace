import * as React from "react";
import { useStore } from "react-redux";
import { useState, useEffect } from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ApplicationState } from "../store";
import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";
import { postFile } from "../util";

interface ProfileActionProps {
  loginActions: LoginActions;
}

interface ProfileConnectedProps {
  login: LoginState;
}

type ProfileProps = ProfileActionProps & ProfileConnectedProps;

const Profile: React.FC<ProfileProps> = (props) => {
  const { handleSubmit, register, errors } = useForm({});
  const { t } = useTranslation();

  const state = useStore();
  const [ name, setName ] = useState<string>();
  const [ photo, setPhoto ] = useState<string>();
  const [ password, setPassword ] = useState<string>();

  useEffect(() => {
    fetch("/users/profile")
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          const { id, username, image } = data;
          updateState(id, username, image);
        }
      })
      .catch(error => console.log(error));
  }, []);

  const updateState = (id: string, username: string, image: string) => {
    setPhoto(image);
    setName(username);
    state.dispatch(actionCreators.setLoggedInUser(id, username, image));
  };

  const handleInputUsernameChange = (value: string) => {
    setName(value);
  };

  const handleInputPasswordChange = (value: string) => {
    setPassword(value);
  };

  const handleButtonApplyClick = handleSubmit((data) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    fetch("/users", {
      method: "PUT",
      headers,
      body: JSON.stringify(data)
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          const { id, username, image } = data;
          updateState(id, username, image);
        }
      })
      .catch(error => console.log(error));
  });

  const handleButtonUploadClick = async (filesToUpload: FileList) => {
    if (filesToUpload && filesToUpload.length > 0) {
      const file = filesToUpload.item(0);

      if (file) {
        const response: string = await postFile("/users/image", file, () => {});

        const responseJson = JSON.parse(response);
        const { id, username, image } = responseJson;
        updateState(id, username, image);
      }
    }
  };

  return (
    <div className="columns" style={{ marginTop: "5rem" }}>
      {(name || photo) ? (
        <div className="column is-8 is-offset-3">
          <div className="columns">
            <div className="column is-one-third">
              <div className="box box-flex">
                <h1 className="title-box-1"><span>{t("Edit Photo")}</span></h1>
                <figure style={{width: "min-content"}}>
                  <span className="image is-128x128">
                    <img src={photo} alt="Logo"/>
                  </span>
                </figure>
                <label className="btn-file">
                  <input
                    className="btn-file__input"
                    onChange={e => { e.target.files && handleButtonUploadClick(e.target.files); }}
                    type="file" />
                  <span className="btn btn-file__span">{t("Upload File")}</span>
                </label>
              </div>
            </div>
            <div className="column is-one-third">
              <div className="box box-flex">
                <h1 className="title-box-1"><span>{t("Edit Account")}</span></h1>
                <form onSubmit={handleButtonApplyClick}>
                  <div className="form-group">
                    <div className="field">
                      <label className="label">{t("Username")}</label>
                      <div className="control">
                        <input
                          className="input-1"
                          type="text"
                          name="username"
                          value={name || ""}
                          onChange={(e) => handleInputUsernameChange(e.currentTarget.value)}
                          ref={register({
                            required: true
                          })} />
                      </div>
                      { errors.username && <p className="help is-danger">* {t("required")}</p>}
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="field">
                      <label className="label">{t("New Password")}</label>
                      <div className="control">
                        <input
                          className="input-1"
                          name="password"
                          onChange={(e) => handleInputPasswordChange(e.currentTarget.value)}
                          type="password" />
                      </div>
                    </div>
                    <div className="field">
                      <label className="label">{t("Confirm Password")}</label>
                      <div className="control">
                        <input
                          className="input-1"
                          name="password_repeat"
                          type="password"
                          ref={register({
                            validate: (value) => !password || value === password
                          })}/>
                        { errors.password_repeat && <p className="help is-danger">* {t("The passwords do not match")}</p>}
                      </div>
                    </div>
                  </div>
                  <button className="btn">{t("Apply")}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : (
        null
      )}
    </div>
  );
};

function mapStateToProps(state: ApplicationState): ProfileConnectedProps {
  return {
    login: state.login
  };
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    loginActions: bindActionCreators(loginActionCreators, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
