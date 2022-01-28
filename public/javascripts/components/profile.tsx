import * as React from "react";
import { useEffect, useState } from "react";
import { Dispatch, bindActionCreators } from "redux";
import { connect } from "react-redux";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { ApplicationState } from "../store";
import { actionCreators as loginActionCreators, LoginActions } from "../actions/login";
import { LoginState } from "../reducers/login";
import { themes } from "../themes";

import LanguageSwitcher from "./language_switcher";
import ProfilePictureUploadForm from "./signup/profile_picture_upload_form";
import InterestSelectForm from "./signup/interest_select_form";
import JoinGroupForm from "./signup/join_group_form";
import UpdatePermissionsForm from "./signup/update_permissions_form";
import UserLogo from "./user_logo";

interface ProfileActionProps {
  loginActions: LoginActions;
}

interface ProfileConnectedProps {
  login: LoginState;
}

type ProfileProps = ProfileActionProps & ProfileConnectedProps;

const Profile: React.FC<ProfileProps> = (props) => {
  const [ displayNotification, setDisplayNotification ] = useState<"success" | "error">();
  const [ following, setFollowing ] = useState<Array<{ id: string, username: string, image: string }>>([]);

  const { handleSubmit, register, formState: { errors }, watch } = useForm({});
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/users/following").then((res) => {
      return res.json();
    }).then(({ following }) => {
      setFollowing(following);
    });
  }, []);

  const handleButtonApplyClick = handleSubmit((data) => {
    fetch("/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(async res => {
      if (res.ok) {
        setDisplayNotification("success");
        setTimeout(() => setDisplayNotification(undefined), 3000);
      }
    }).catch(() => {
      setDisplayNotification("error");
      setTimeout(() => setDisplayNotification(undefined), 3000);
    });
  });

  const updateTheme = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const theme = e.target.value;
    props.loginActions.performThemeChange(theme);
  };

  const closeNotification = () => {
    setDisplayNotification(undefined);
  };

  if (!props.login.user) {
    return null;
  }

  const { login: { user } } = props;

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">{t("Edit Profile")}</h1>
        <h2 className="subtitle">{user.username}</h2>

        <hr/>

        <div className="columns is-vcentered">
          <div className="column is-one-quarter">
            <ProfilePictureUploadForm
              currentImage={user.image!}
              onComplete={(newImage) => {
                props.loginActions.setLoggedInUser(
                  user.id, user.username, newImage, user.admin, user.theme, user.email
                );

                setDisplayNotification("success");
                setTimeout(() => setDisplayNotification(undefined), 3000);
              }}
            />
          </div>

          <div className="column is-half is-offset-1">
            <h5 className="title is-5">{t("Change Settings")}</h5>

            <form onSubmit={handleButtonApplyClick}>
              <div className="field">
                <label htmlFor="" className="label">{t("E-Mail")}</label>
                <div className="control has-icons-left">
                  <input
                    type="email"
                    placeholder={t("E-Mail")}
                    defaultValue={user.email}
                    className="input"
                    {...register("email")}
                  />
                  <span className="icon is-small is-left">
                    <i className="fa fa-lock"></i>
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
                    {...register("password")}
                  />
                  <span className="icon is-small is-left">
                    <i className="fa fa-lock"></i>
                  </span>
                </div>
              </div>

              <div className="field">
                <label htmlFor="" className="label">{t("Confirm Password")}</label>
                <div className="control has-icons-left">
                  <input
                    type="password"
                    placeholder={t("Confirm Password")}
                    className="input"
                    {...register("confirmation", {
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
                  <LanguageSwitcher registerFunction={register} />
                </div>
              </div>

              <div className="field">
                <label className="label">{t("Colour Theme")}</label>
                <div className="control">
                  <div className="select">
                    <select defaultValue={user.theme} onChange={updateTheme}>
                      {Object.entries(themes.data).map(([key, theme]) => {
                        return (
                          <option key={key} value={key}>{theme.name}</option>
                        );
                      })}
                    </select>
                  </div>
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

        <div className="columns">
          <div className="column">
            <h5 className="title is-5">{t("People you are following")}</h5>
            <hr/>

            {(following.length == 0) && (
              <p>{t("You are not following anyone yet!")}</p>
            )}

            <div className="columns is-multiline">
              {following.map(({ id, username, image }) => {
                return (
                  <div key={id} className="column is-2" style={{ borderRight: "1px solid #E2E2E2", marginBottom: "0.75rem" }}>
                    <article className="media">
                      <UserLogo user={{ id, username, image }} hideName={true} />
                      <div className="media-content" style={{ display: "flex", alignSelf: "center" }}>
                        <strong>{username}</strong>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
            <hr/>
          </div>
        </div>

        <div className="columns">
          <div className="column">
            <h5 className="title is-5">{t("Update Interests")}</h5>
            <InterestSelectForm
              deleteUnselectedInterests={true}
              onComplete={() => {
                setDisplayNotification("success");
                setTimeout(() => setDisplayNotification(undefined), 3000);
              }}
            />
          </div>
        </div>

        <div className="columns">
          <div className="column">
            <h5 className="title is-5">{t("Update Group Membership")}</h5>
            <JoinGroupForm
              onComplete={() => {
                setDisplayNotification("success");
                setTimeout(() => setDisplayNotification(undefined), 3000);

                // Refresh page
                navigate(0);
              }}
            />
          </div>
        </div>

        <div className="columns">
          <div className="column">
            <h5 className="title is-5">{t("Update Group Permission Settings")}</h5>
            <UpdatePermissionsForm />
          </div>
        </div>
      </div>

      {(displayNotification == "success") ? (
        <div className="notification is-success fixed-notification">
          <button className="delete" onClick={closeNotification}></button>
          {t("Data saved successfully")}
        </div>
      ) : (displayNotification == "error") ? (
        <div className="notification is-error fixed-notification">
          <button className="delete" onClick={closeNotification}></button>
          {t("Could not save data")}
        </div>
      ) : null}
    </section>
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
