import * as React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const { t } = useTranslation();
  const history = useHistory();

  const navigateTo = (destination: string) => {
    return () => {
      history.push(destination);
    };
  };

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
                <li className="home__menu-item" onClick={navigateTo("/userPosts")}>
                  {t("My Posts")}
                </li>
                <li className="home__menu-item" onClick={navigateTo("/posts")}>
                  {t("Explore")}
                </li>
                <li className="home__menu-item" onClick={navigateTo("/upload")}>
                  {t("Create")}
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
