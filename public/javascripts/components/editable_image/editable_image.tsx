import * as React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import debounce from "lodash.debounce";

import ColorPicker from "./color_picker";
import ToolPicker from "./tool_picker";

type Coords = [x: number, y: number];

interface CoordinateEvent {
  clientX: number;
  clientY: number;
}

interface EditableImageProps {
  imageUrl: string;
  dimensions: [number, number];
  onSave: (imageData: string) => void;
  onCancel: () => void;
}

const EditableImage: React.FC<EditableImageProps> = ({ imageUrl, dimensions: [ width, height ], onSave, onCancel }) => {
  const { t } = useTranslation();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>();

  const penColor = useRef("255, 0, 0");
  const drawTool = useRef("pen");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0, width, height);
    };
    image.src = imageUrl;
    image.crossOrigin = "Anonymous";
    imageRef.current = image;

    let isDrawing = false;
    let prevCoords: Coords;

    const getMousePosition = (e: CoordinateEvent): Coords => {
      const boundingRect = canvas.getBoundingClientRect();

      return [
        e.clientX - boundingRect.left,
        e.clientY - boundingRect.top
      ];
    };

    canvas.onmousedown = (e: MouseEvent) => {
      isDrawing = true;
      prevCoords = getMousePosition(e);
    };

    canvas.ontouchstart = (e: TouchEvent) => {
      isDrawing = true;
      const touch = e.touches[0];

      prevCoords = getMousePosition(touch);
    };

    canvas.onmouseup = () => {
      isDrawing = false;
    };

    canvas.ontouchend = () => {
      isDrawing = false;
    };

    const onMove = debounce((e: CoordinateEvent) => {
      if (isDrawing) {
        const [ x, y ] = getMousePosition(e);
        const [ prevX, prevY ] = prevCoords;

        if (drawTool.current == "pen") {
          context.globalCompositeOperation = "source-over";
          context.lineWidth = 4;
        } else {
          context.globalCompositeOperation = "multiply";
          context.lineWidth = 20;
        }

        context.strokeStyle = `rgb(${penColor.current})`;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(x, y);

        context.stroke();
        context.closePath();

        prevCoords = [x, y];
      }
    }, 10, { leading: true });

    canvas.onmousemove = onMove;
    canvas.ontouchmove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const touch = e.touches[0];
      onMove(touch);
    };

    const willPreventDefault = (e: TouchEvent) => {
      if (e.target == canvas) {
        e.preventDefault();
      }
    };

    document.body.addEventListener("touchstart", willPreventDefault, false);
    document.body.addEventListener("touchmove", willPreventDefault, false);
    document.body.addEventListener("touchend", willPreventDefault, false);

    return () => {
      document.body.removeEventListener("touchstart", willPreventDefault);
      document.body.removeEventListener("touchmove", willPreventDefault);
      document.body.removeEventListener("touchend", willPreventDefault);
    };
  }, []);

  const onSaveClicked = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const onClearClicked = () => {
    const context = canvasRef.current?.getContext("2d");

    if (imageRef.current && context) {
      context.globalCompositeOperation = "source-over";
      context.drawImage(imageRef.current, 0, 0, width, height);
    }

    console.log("clear:", context, imageRef.current);
  };

  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "16/9"
  };

  const innerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ width: "100%", backgroundColor: "#F9F9F9" }}>
        <div style={innerStyle}>
          <div>
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
            />

            <ToolPicker
              onToolPicked={(tool) => {
                console.log("tool picked:", tool);
                drawTool.current = tool;
              }}
            />

            <ColorPicker
              offsetTop={120}
              onColorPicked={(color) => {
                console.log("color picked:", color);
                penColor.current = color;
              }}
            />

            <div className="columns is-mobile">
              <div className="column">
                <div className="field is-grouped is-grouped-left mt-2 mb-2">
                  <p className="control">
                    <a className="button is-danger" onClick={onClearClicked}>
                      {t("Clear")}
                    </a>
                  </p>
                </div>
              </div>

              <div className="column">
                <div className="field is-grouped is-grouped-right mt-2 mb-2">
                  <p className="control">
                    <a className="button is-info" onClick={onSaveClicked}>
                      {t("Save")}
                    </a>
                  </p>
                  <p className="control">
                    <a className="button is-info is-light" onClick={onCancel}>
                      {t("Cancel")}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditableImage;
