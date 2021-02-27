import * as React from "react";
import { convertHMS } from "../../util";

interface TimeCodeProps {
  time: number;
}

const TimeCode: React.FC<TimeCodeProps> = (props) => {
  const { time } = props;

  return (
    <span className="timecode">
      {convertHMS(time)}
    </span>
  );
};

export default TimeCode;
