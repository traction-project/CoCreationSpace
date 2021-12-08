import * as React from "react";

import { convertHMS } from "../util";
import { VideoChapter } from "./media_player_with_chapters";

interface ChapterListProps {
  chapters: Array<VideoChapter>;
  onChapterClicked: (startTime: number) => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ chapters, onChapterClicked }) => {
  if (chapters.length == 0) {
    return null;
  }

  return (
    <div className="mt-2 columns is-centered">
      <div className="column is-10">
        <table className="table is-striped is-hoverable is-fullwidth is-bordered">
          <tbody>
            {chapters.map(({ name, startTime}, i) => {
              return (
                <tr key={i} style={{ cursor: "pointer" }} onClick={() => onChapterClicked(startTime)}>
                  <td style={{ width: 300 }}>[{convertHMS(startTime)}]</td>
                  <td>{name}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChapterList;
