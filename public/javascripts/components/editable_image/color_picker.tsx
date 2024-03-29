import * as React from "react";
import { useState } from "react";

interface ColorPickerProps {
  offsetTop?: number
  onColorPicked: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ offsetTop = 15, onColorPicked }) => {
  const colors = [
    "255, 0, 0",
    "0, 255, 0",
    "0, 0, 255"
  ];

  const [ pickedColor, setPickedColor ] = useState(colors[0]);

  const boxStyle: React.CSSProperties = {
    position: "absolute",
    top: offsetTop,
    marginLeft: 5,
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
            style={{ ...boxStyle, top: i * 35 + offsetTop }}
            onClick={onBoxClicked(c)}
          >
            <div style={{
              width: (pickedColor == c) ? 28 : 24,
              height: (pickedColor == c) ? 28 : 24,
              marginLeft: (pickedColor == c) ? 1 : 3,
              marginTop: (pickedColor == c) ? 1 : 3,
              borderRadius: 2,
              backgroundColor: `rgb(${c})`
            }} />
          </div>
        );
      })}
    </>
  );
};

export default ColorPicker;
