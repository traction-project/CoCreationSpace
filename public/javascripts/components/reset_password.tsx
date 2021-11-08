import * as React from "react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";

interface ResetPasswordProps {
}

const ResetPassword: React.FC<ResetPasswordProps> = (props) => {
  const { register, watch, handleSubmit, formState: { errors } } = useForm();
  const { t } = useTranslation();
  const { resettoken } = useParams<{ resettoken: string }>();
  const history = useHistory();

  const [ hasError, setHasError ] = useState(false);

  const onSubmit = handleSubmit(async ({ password }) => {
    const res = await fetch("/resetpassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, resettoken })
    });

    if (res.ok) {
      setHasError(false);
      history.push("/login");
    } else {
      setHasError(true);
    }
  });

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body opera-background">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-6-tablet is-5-desktop is-5-widescreen">
              <form onSubmit={onSubmit} className="box">
                <h4 className="title is-4">{t("Reset password")}</h4>

                {hasError && (
                  <article className="message is-danger">
                    <div className="message-body">
                      <Trans i18nKey="request-reset-error">
                        <strong>Error!</strong> Could not reset password.
                      </Trans>
                    </div>
                  </article>
                )}

                <div className="field">
                  <label htmlFor="" className="label">{t("Password")}</label>
                  <div className="control has-icons-left">
                    <input
                      type="password"
                      placeholder={t("Password")}
                      className="input"
                      required={true}
                      {...register("password", {
                        required: true
                      })}
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
                      required={true}
                      {...register("confirmation", {
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
                  <button type="submit" disabled={(watch("password") || "").length == 0} className="button is-info">
                    {t("Reset password")}
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

export default ResetPassword;
