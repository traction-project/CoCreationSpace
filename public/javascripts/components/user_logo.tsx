import * as React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { CommonType } from "../util";

export interface UserType extends CommonType {
  username: string;
  image?: string;
}

interface UserLogoProps {
  user: UserType;
  hideName?: boolean;
}

const UserLogo: React.FC<UserLogoProps> = ({ user, hideName = false }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navigateTo = (destination: string) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(destination);
    };
  };

  return (
    <figure
      className="media-left"
      style={{width: "min-content", paddingRight: "1rem", cursor: "pointer" }}
      onClick={navigateTo(`/profile/${user.id}`)}
    >
      <span className="image is-64x64">
        {(user.image) ? (
          <img src={user.image} alt="Logo"/>
        ) : (
          <img src="/images/default.png" alt="Logo"/>
        )}
      </span>
      {(!hideName) && (
        (user.username) ? (
          <p>{user.username}</p>
        ) : (
          <p>{t("Anonymous")}</p>
        )
      )}
    </figure>
  );
};

export default UserLogo;
