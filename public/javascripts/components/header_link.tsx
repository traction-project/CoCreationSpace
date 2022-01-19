import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import classNames from "classnames";

interface HeaderLinkProps {
  to: string;
  onClick: () => void;
}

const HeaderLink: React.FC<HeaderLinkProps> = (props) => {
  const { to, onClick, children } = props;
  const location = useLocation();

  return (
    <Link
      className={classNames("navbar-item", { "is-active": location.pathname == to})}
      onClick={onClick}
      to={to}
    >
      {children}
    </Link>
  );
};

export default HeaderLink;
