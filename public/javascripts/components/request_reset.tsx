import * as React from "react";
import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

interface RequestResetProps {
}

const RequestReset: React.FC<RequestResetProps> = (props) => {
  const { register, watch, handleSubmit } = useForm();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [ hasError, setHasError ] = useState(false);

  const onSubmit = handleSubmit(async ({ email }) => {
    const res = await fetch("/requestreset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    if (res.ok) {
      setHasError(false);
      navigate(-1);
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
                <h4 className="title is-4">{t("Request password reset")}</h4>

                {hasError && (
                  <article className="message is-danger">
                    <div className="message-body">
                      <Trans i18nKey="request-reset-error-email">
                        <strong>Error!</strong> Could not request password reset for the given e-mail address.
                      </Trans>
                    </div>
                  </article>
                )}

                <div className="field">
                  <label htmlFor="" className="label">{t("E-Mail")}</label>
                  <div className="control has-icons-left">
                    <input
                      type="email"
                      placeholder={t("E-Mail")}
                      className="input"
                      required={true}
                      {...register("email")}
                    />
                    <span className="icon is-small is-left">
                      <i className="fa fa-envelope" />
                    </span>
                  </div>
                </div>

                <div className="field">
                  <button type="submit" disabled={(watch("email") || "").length == 0} className="button is-info">
                    {t("Request reset")}
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

export default RequestReset;
