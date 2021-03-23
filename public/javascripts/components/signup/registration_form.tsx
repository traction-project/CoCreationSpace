import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation, Trans } from "react-i18next";

import LanguageSwitcher from "../language_switcher";

interface RegistrationFormProps {
  onComplete?: (id: string, username: string, image: string) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = (props) => {
  const { onComplete } = props;

  const [ error, setError ] = useState<string>();
  const { t } = useTranslation();
  const { handleSubmit, register, errors, watch } = useForm({});

  const handleButtonSubmitClick = handleSubmit(async ({ username, password, email, preferredLanguage, participantCode }) => {
    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, preferredLanguage, participantCode })
      });

      if (res.ok) {
        const res = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        if (res.ok) {
          const { user } = await res.json();
          onComplete?.(user.id, user.username, user.image);
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
      {error && (
        <article className="message is-danger">
          <div className="message-body">
            {(error == "Username exists") ? (
              <Trans i18nKey="registration-error-username-exists">
                <strong>Registration failed!</strong> Username already exists.
              </Trans>
            ) : (
              <Trans i18nKey="registration-error-unknown">
                <strong>Registration failed!</strong> An unknown error occurred.
              </Trans>
            )}
          </div>
        </article>
      )}

      <div className="field">
        <label htmlFor="" className="label">{t("Username")} *</label>
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
            <i className="fa fa-user" />
          </span>
        </div>
        {errors.username && <p className="help is-danger">{t("required")}</p>}
      </div>

      <div className="field">
        <label htmlFor="" className="label">{t("Participant Code")}</label>
        <div className="control has-icons-left">
          <input
            type="text"
            placeholder={t("Participant Code")}
            name="participantCode"
            className="input"
            ref={register}
          />
          <span className="icon is-small is-left">
            <i className="fa fa-user" />
          </span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="" className="label">{t("E-Mail")}</label>
        <div className="control has-icons-left">
          <input
            type="email"
            placeholder={t("E-Mail")}
            name="email"
            className="input"
            ref={register}
          />
          <span className="icon is-small is-left">
            <i className="fa fa-envelope" />
          </span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="" className="label">{t("Password")} *</label>
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
        <label htmlFor="" className="label">{t("Confirm Password")} *</label>
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

      <p>
        * {t("required")}
      </p>

      <div className="field pt-4">
        <button type="submit" className="button is-info">
          {t("Submit")}
        </button>
      </div>
    </form>
  );
};

export default RegistrationForm;
