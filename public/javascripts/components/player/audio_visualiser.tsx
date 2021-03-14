import * as React from "react";
import { useEffect, useRef, useState } from "react";

interface AudioVisualiserProps {
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioVisualiser: React.FC<AudioVisualiserProps> = (props) => {
  const { audioRef } = props;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [ activeCue, setActiveCue ] = useState<string>();

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

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
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

    audioRef.current.textTracks.onchange = (e) => {
      const trackList = e.currentTarget as TextTrackList;

      for (let i=0; i<trackList.length; i++) {
        if (trackList[i].mode == "showing") {
          trackList[i].oncuechange = (e) => {
            const track = e.currentTarget as TextTrack;

            if (track.activeCues) {
              for (let i=0; i<track.activeCues.length; i++) {
                const cue = track.activeCues[i] as VTTCue;
                setActiveCue(cue.text);
              }
            }
          };
        } else {
          trackList[i].oncuechange = () => {};
        }
      }
    };

    audioRef.current.onplay = () => {
      audioContext.resume();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="audiovis">
      <canvas ref={canvasRef} className="audiovis" />

      {(activeCue && activeCue.length > 0) && (
        <div className="cue">
          <p>{activeCue}</p>
        </div>
      )}
    </div>
  );
};

export default AudioVisualiser;
