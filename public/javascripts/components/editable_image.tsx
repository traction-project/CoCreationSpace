import * as React from "react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

type Coords = [x: number, y: number];

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

    const getMousePosition = (e: MouseEvent): Coords => {
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

    canvas.onmouseup = () => {
      isDrawing = false;
    };

    canvas.onmousemove = (e: MouseEvent) => {
      if (isDrawing) {
        const [ x, y ] = getMousePosition(e);
        const [ prevX, prevY ] = prevCoords;

        context.beginPath();
        context.moveTo(prevX, prevY);
        context.lineTo(x, y);

        context.strokeStyle = "red";
        context.lineWidth = 2;

        context.stroke();
        context.closePath();

        prevCoords = [x, y];
      }
    };
  }, []);

  const onSaveClicked = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL());
    }
  };

  const onClearClicked = () => {
    const context = canvasRef.current?.getContext("2d");
    imageRef.current && context?.drawImage(imageRef.current, 0, 0, width, height);

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

            <div className="columns">
              <div className="column">
                <div className="field is-grouped is-grouped-left m-2">
                  <p className="control ml-2">
                    <a className="button is-danger" onClick={onClearClicked}>
                      {t("Clear")}
                    </a>
                  </p>
                </div>
              </div>

              <div className="column">
                <div className="field is-grouped is-grouped-right m-2">
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
