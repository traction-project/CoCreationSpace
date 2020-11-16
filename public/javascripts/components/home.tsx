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
          <div className="columns is-centered is-mobile">
            <div className="column is-5-desktop is-6-tablet is-10-mobile">
              <ul className="home__menu">
                <li className="home__menu-item">
                  <Link to={"userPosts"}>
                    {t("My Posts")}
                  </Link>
                </li>
                <li className="home__menu-item">
                  <Link to={"posts"}>
                    {t("Explore")}
                  </Link>
                </li>
                <li className="home__menu-item">
                  <Link to={"upload"}>
                    {t("Create")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
