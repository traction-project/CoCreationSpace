import * as React from "react";
import { useState } from "react";

import { convertHMS } from "../../util";

interface TimeCodeProps {
  time: number;
  duration?: number;
}

const TimeCode: React.FC<TimeCodeProps> = (props) => {
  const { time, duration } = props;
  const [ displayMode, setDisplayMode ] = useState<"elapsed" | "remaining">("elapsed");

  return (
    <span className="timecode" onClick={() => setDisplayMode((displayMode == "elapsed") ? "remaining" : "elapsed")}>
      {(displayMode == "elapsed") ? (
        <>
          {convertHMS(time)}
          {(duration && !Number.isNaN(duration)) ? (
            <>
              &nbsp;/&nbsp;
              {convertHMS(duration)}
            </>
          ) : (
            null
          )}
        </>
      ) : (
        <>
          {(duration && !Number.isNaN(duration)) ? (
            <>
              -{convertHMS(duration - time)}
            </>
          ) : (
            null
          )}
        </>
      )}
    </span>
  );
};

export default TimeCode;
