import * as React from "react";
import { useEffect, useRef } from "react";

interface AudioVisualiserProps {
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioVisualiser: React.FC<AudioVisualiserProps> = (props) => {
  const { audioRef } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current || !wrapperRef.current) {
      return;
    }

    canvasRef.current.width = wrapperRef.current.clientWidth;
    canvasRef.current.height = wrapperRef.current.clientHeight;

    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const canvasContext = canvasRef.current.getContext("2d");

    if (!canvasContext) {
      return;
    }

    const audioContext = new AudioContext();

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const source = audioContext.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    source.connect(audioContext.destination);

    const data = new Uint8Array(analyser.frequencyBinCount);

    const loop = () => {
      requestAnimationFrame(loop);
      analyser.getByteFrequencyData(data);

      canvasContext.fillStyle = "#E2E2E2";
      canvasContext.fillRect(0, 0, width, height);

      data.forEach((value, i) => {
        const barWidth = width / data.length;
        const barHeight = (value / 255) * height;

        const x = barWidth * i;

        canvasContext.fillStyle = "#76AB7D";
        canvasContext.fillRect(x, height - barHeight, barWidth, barHeight);
      });
    };

    loop();

    audioRef.current.onplay = () => {
      audioContext.resume();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="audiovis">
      <canvas ref={canvasRef} className="audiovis" />
    </div>
  );
};

export default AudioVisualiser;
