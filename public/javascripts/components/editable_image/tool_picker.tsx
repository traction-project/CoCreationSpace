import * as React from "react";
import { useState } from "react";

interface ToolPickerProps {
  offsetTop?: number
  onToolPicked: (tool: string) => void;
}

const ToolPicker: React.FC<ToolPickerProps> = ({ offsetTop = 15, onToolPicked }) => {
  const [ pickedTool, setPickedTool ] = useState<string>("pen");

  const tools: { [key: string]: string } = {
    "pen": "fa-pencil-alt",
    "highlighter": "fa-highlighter"
  };

  const boxStyle: React.CSSProperties = {
    position: "absolute",
    top: offsetTop, left: 15,
    width: 26, height: 26,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    boxShadow: "1px 1px 3px 0px rgba(60,60,60,0.75)",
    cursor: "pointer",
    boxSizing: "content-box"
  };

  const onBoxClicked = (tool: string) => {
    return () => {
      setPickedTool(tool);
      onToolPicked(tool);
    };
  };

  return (
    <>
      {Object.entries(tools).map(([tool, icon], i) => {
        return (
          <div
            key={i}
            style={{ ...boxStyle, top: i * 45 + offsetTop, border: (pickedTool == tool) ? "2px solid #555555" : "2px solid transparent" }}
            onClick={onBoxClicked(tool)}
          >
            <p style={{ textAlign: "center", marginTop: 3 }}>
              <i
                className={`fas ${icon}`}
                style={{ fontSize: 20 }}
              />
            </p>
          </div>
        );
      })}
    </>
  );
};

export default ToolPicker;
