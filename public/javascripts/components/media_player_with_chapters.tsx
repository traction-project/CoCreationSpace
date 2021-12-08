import * as React from "react";
import { useEffect, useState } from "react";

import { convertHMS } from "../util";
import MediaPlayer, { VideoChapter } from "./media_player";

interface MediaPlayerWithChaptersProps {
  id: string;
  type?: "video" | "audio";
}

const MediaPlayerWithChapters: React.FC<MediaPlayerWithChaptersProps> = (props) => {
  const { id: videoId, type = "video" } = props;
  const [ chapters, setChapters ] = useState<Array<VideoChapter>>([]);

  const fetchChapters = () => {
    fetch(`/media/${videoId}/chapters`).then((res) => {
      return res.json();
    }).then(({ chapters }) => {
      setChapters(chapters);
    });
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  return (
    <>
      <MediaPlayer
        id={videoId}
        onChapterAdded={fetchChapters}
        type={type}
      />

      {(chapters.length > 0) && (
        <div className="mt-2 columns is-centered">
          <div className="column is-10">
            <table className="table is-striped is-hoverable is-fullwidth is-bordered">
              <tbody>
                {chapters.map(({ name, startTime}, i) => {
                  return (
                    <tr key={i}>
                      <td style={{ width: 300 }}>[{convertHMS(startTime)}]</td>
                      <td>{name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default MediaPlayerWithChapters;
