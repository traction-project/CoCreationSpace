import * as React from "react";
import { CommonType } from "../util";

export type UserType = {
  username: string;
  image?: string;
} & CommonType;

interface UserLogoProps {
  user: UserType;
}

const UserLogo: React.FC<UserLogoProps> = (props) => {
  return (
    <figure className="media-left" style={{width: "min-content", paddingRight: "1rem"}}>
      <span className="image is-64x64">
        { props.user.image ?
          <img src={props.user.image} alt="Logo"/>
          : <img src="/images/default.png" alt="Logo"/>
        }
      </span>
      {props.user && props.user.username ?
        <p>{props.user.username}</p>
        : <p>Anonymous</p>
      }
    </figure>
  );
};

export default UserLogo;
