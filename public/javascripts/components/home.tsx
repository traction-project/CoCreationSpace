import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LanguageSwitcher from "./language_switcher";

interface HomeProps {
}

const Home: React.FC<HomeProps> = (props) => {
  const { t } = useTranslation();

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
              <div className="box">
                <h4 className="title is-4 has-text-centered">
                  {t("Welcome to the CoCreation Space!")}
                </h4>

                <div className="columns is-centered is-mobile">
                  <div className="column">
                    <Link className="button navbar-item is-info" to={"/login"}>{t("Sign In")}</Link>
                  </div>
                  <div className="column">
                    <Link className="button navbar-item is-light" to={"/signup"}>{t("Sign Up")}</Link>
                  </div>
                </div>

                <div className="has-children-centered">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
