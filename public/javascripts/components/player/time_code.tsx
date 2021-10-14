import * as React from "react";
import { convertHMS } from "../../util";

interface TimeCodeProps {
  time: number;
  duration?: number;
}

const TimeCode: React.FC<TimeCodeProps> = (props) => {
  const { time, duration } = props;

  return (
    <span className="timecode">
      {convertHMS(time)}
      {(duration && !Number.isNaN(duration)) ? (
        <>
          &nbsp;/&nbsp;
          {convertHMS(duration)}
        </>
      ) : (
        null
      )}
    </span>
  );
};

export default TimeCode;
