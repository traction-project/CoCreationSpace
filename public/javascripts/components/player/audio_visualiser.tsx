import * as React from "react";
import { useEffect } from "react";

interface AudioVisualiserProps {
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioVisualiser: React.FC<AudioVisualiserProps> = (props) => {
  const { audioRef } = props;

  useEffect(() => {
    if (!audioRef.current) {
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

      console.log(data);
    };

    loop();

    audioRef.current.onplay = () => {
      audioContext.resume();
    };
  }, []);

  return (
    <canvas className="audiovis" />
  );
};

export default AudioVisualiser;
