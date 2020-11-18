import * as React from "react";
import ProgressRing from "./progress_ring";

interface ProgressBoxProps {
  progress: number;
  total: number;
}

const ProgressBox: React.FC<ProgressBoxProps> = (props) => {
  const { progress, total } = props;

  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    paddingBottom: "56.25%",
    position: "relative",
    border: "1px solid #F5F5F5"
  };

  const innerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0, left: 0, bottom: 0, right: 0
  };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        <ProgressRing
          radius={120}
          stroke={15}
          progress={progress}
          total={total}
        />
      </div>
    </div>
  );
};

export default ProgressBox;
