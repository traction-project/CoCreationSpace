import * as React from "react";
import { commonType } from "../util";

export type UserType = {
  username: string;
} & commonType;

interface UserLogoProps {
  user: UserType;
}

const UserLogo: React.FC<UserLogoProps> = (props) => {
  return (
    <figure className="media-left">
      <p className="image is-64x64">
        <img src="https://tecnoduero.com/wp-content/uploads/2017/02/h.png" alt="Logo"/>
      </p>
    </figure>
  );
};

export default UserLogo;