import * as React from "react";

interface BlankVideoProps {
  width?: number;
  message?: string;
}

const BlankVideo: React.FC<BlankVideoProps> = (props) => {
  const { width, message } = props;

  const wrapperStyle: React.CSSProperties = (width) ? {
    width: width,
    height: 9/16 * width,
    backgroundColor: "#000"
  } : {
    width: "100%",
    paddingBottom: "56.25%",
    position: "relative",
    backgroundColor: "#000"
  };

  const innerStyle: React.CSSProperties = (width) ? {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%"
  } : {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0, left: 0, bottom: 0, right: 0
  };

  return (
    <div style={wrapperStyle}>
      <div style={innerStyle}>
        <p style={{ color: "#FFF" }}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default BlankVideo;
