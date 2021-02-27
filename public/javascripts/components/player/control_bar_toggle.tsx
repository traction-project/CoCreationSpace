import * as React from "react";
import classNames from "classnames";

interface ControlBarToggleProps {
  isToggled: boolean;
  icons: [string, string];
  onButtonToggled: () => void;
}

const ControlBarToggle: React.FC<ControlBarToggleProps> = (props) => {
  const { isToggled, icons: [ onIcon, offIcon ], onButtonToggled } = props;

  return (
    <span onClick={onButtonToggled} className="controlbutton icon">
      <i className={classNames("fas", { [onIcon]: isToggled, [offIcon]: !isToggled })} />
    </span>
  );
};

export default ControlBarToggle;
