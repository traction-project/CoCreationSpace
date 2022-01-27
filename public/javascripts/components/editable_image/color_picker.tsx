import * as React from "react";
import { useState } from "react";

interface ColorPickerProps {
  onColorPicked: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorPicked }) => {
  const [ pickedColor, setPickedColor ] = useState("red");

  const colors = [
    "red",
    "green",
    "blue"
  ];

  const boxStyle: React.CSSProperties = {
    position: "absolute",
    top: 15, left: 15,
    width: 30, height: 30,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    boxShadow: "1px 1px 3px 0px rgba(60,60,60,0.75)",
    cursor: "pointer"
  };

  const onBoxClicked = (color: string) => {
    return () => {
      setPickedColor(color);
      onColorPicked(color);
    };
  };

  return (
    <>
      {colors.map((c, i) => {
        return (
          <div
            key={i}
            style={{ ...boxStyle, top: i * 45 + 15 }}
            onClick={onBoxClicked(c)}
          >
            <div style={{
              width: (pickedColor == c) ? 28 : 24,
              height: (pickedColor == c) ? 28 : 24,
              marginLeft: (pickedColor == c) ? 1 : 3,
              marginTop: (pickedColor == c) ? 1 : 3,
              borderRadius: 2,
              backgroundColor: c
            }} />
          </div>
        );
      })}
    </>
  );
};

export default ColorPicker;
