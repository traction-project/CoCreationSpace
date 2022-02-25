import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface NotFoundProps {
}

const NotFound: React.FC<NotFoundProps> = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body opera-background">
        <div className="container">
          <div className="columns is-centered is-mobile">
            <div className="column is-4-desktop is-6-tablet is-6-mobile">
              <figure className="image is-square no-border">
                <img src="/images/ccs_logo_transparent.png"  />
              </figure>
            </div>
          </div>
          <div className="columns is-centered is-mobile">
            <div className="column is-5-desktop is-6-tablet is-10-mobile">
              <h2 className="title is-2 has-text-centered">
                {t("Page not found!")}
              </h2>
            </div>
          </div>
          <div className="columns is-centered is-mobile">
            <div className="column is-2">
              <button className="button is-info is-fullwidth" onClick={() => navigate(-1)}>
                {t("Back")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
