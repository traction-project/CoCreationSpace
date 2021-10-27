import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { UserType } from "./user_logo";
import { PostType } from "./post/post";

interface PublicUserType extends UserType {
  posts: PostType,
  groups: Array<{ id: string, name: string }>
}

interface PublicProfileProps {
}

const PublicProfile: React.FC<PublicProfileProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const [ user, setUser ] = useState<PublicUserType>();

  useEffect(() => {
    fetch(`/users/profile/${id}`).then((res) => {
      return res.json();
    }).then((data) => {
      setUser(data);
    });
  }, []);

  if (!user) {
    return null;
  }

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Profile</h1>
        <h2 className="subtitle">{user.username}</h2>

        <hr/>

        <div className="columns is-vcentered">
          <div className="column is-one-quarter">
            <div className="box-flex">
              <figure style={{ width: "min-content" }}>
                <span className="image is-128x128">
                  <img src={user.image} alt="Logo" />
                </span>
              </figure>
            </div>
          </div>

          <div className="column is-half is-offset-1">
            <h5 className="title is-5">{t("Groups")}</h5>

            {user.groups.map(({ id, name }) => {
              return (
                <span
                  key={id}
                  className={classNames("tag", "is-large", "is-primary")}
                >
                  {name}
                </span>
              );
            })}
          </div>
        </div>

        <hr/>

        <div className="columns">
          <div className="column">
            <h5 className="title is-5">{t("Latest Posts")}</h5>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicProfile;
