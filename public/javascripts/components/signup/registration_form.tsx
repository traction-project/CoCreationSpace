import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation, Trans } from "react-i18next";

import LanguageSwitcher from "../language_switcher";

interface RegistrationFormProps {
  onComplete?: (username: string, password: string, image: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = (props) => {
  const { onComplete } = props;

  const [ error, setError ] = useState<string>();
  const { t } = useTranslation();
  const { handleSubmit, register, errors, watch } = useForm({});

  const handleButtonSubmitClick = handleSubmit(async ({ username, password, preferredLanguage }) => {
    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, preferredLanguage })
      });

      if (res.ok) {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        if (res.ok) {
          const { user } = await res.json();
          onComplete?.(user.username, user.password, user.image);
        } else {
          const data = await res.json();
          setError(data.message);
        }
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch (err) {
      console.log(err);
      setError(err);
    }
  });

  return (
    <form onSubmit={handleButtonSubmitClick}>
      <h4 className="title is-4">{t("Create Account")}</h4>

      {error && (
        <article className="message is-danger">
          <div className="message-body">
            {(error == "Username exists") ? (
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
  );
};

export default RegistrationForm;
