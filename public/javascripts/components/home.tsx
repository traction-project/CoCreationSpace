import * as React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { t } = useTranslation();

  return (
    <section className="hero is-fullheight-with-navbar">
      <div className="hero-body opera-background">
        <div className="container">
          <div className="columns is-centered is-mobile">
            <div className="column is-4-desktop is-6-tablet is-6-mobile">
              <figure className="image is-square no-border">
                <img src="/images/traction-logo-white-big.png"  />
              </figure>
            </div>
          </div>
          <div className="columns is-centered">
            <div className="column">
              <Link className="button" to={"userPosts"}>{t("My Posts")}</Link>
            </div>
            <div className="column">
              <Link className="button" to={"userPosts"}>{t("Explore")}</Link>
            </div>
            <div className="column">
              <Link className="button" to={"userPosts"}>{t("Create")}</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
