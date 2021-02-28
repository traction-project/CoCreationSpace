import * as React from "react";
import { TimelineEmoji, TimelineComment } from "./dash_player";

interface SeekBarProps {
  onSeek: (seekPosition: number) => void;
  progress: number;
  timelineEmojis: Array<TimelineEmoji>;
  timelineComments: Array<TimelineComment>;
}

const SeekBar: React.FC<SeekBarProps> = (props) => {
  const { onSeek, progress, timelineEmojis, timelineComments } = props;

  const seekPlayer = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.pageX - rect.left;

    onSeek(x / rect.width);
  };

  return (
    <div className="seekbar" onClick={seekPlayer}>
      <div className="progressbar" style={{ width: `${progress * 100}%` }} />

      {timelineEmojis.map(({ progressPosition, emoji }, i) => {
        return (
          <span key={i} className="video-marker" style={{ left: `${progressPosition}%`}}>{emoji}</span>
        );
      })}

      {timelineComments.map(({ progressPosition }, i) => {
        return (
          <i key={i} className="fas fa-comment video-marker" style={{ left: `${progressPosition}%`}} />
        );
      })}
    </div>
  );
};

export default SeekBar;
