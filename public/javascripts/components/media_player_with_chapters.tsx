import * as React from "react";
import { useEffect, useState } from "react";

import ChapterList from "./chapter_list";
import MediaPlayer from "./media_player";

export interface VideoChapter {
  name: string;
  startTime: number;
}

interface MediaPlayerWithChaptersProps {
  id: string;
  type?: "video" | "audio";
}

const MediaPlayerWithChapters: React.FC<MediaPlayerWithChaptersProps> = (props) => {
  const { id: videoId, type = "video" } = props;

  const [ chapters, setChapters ] = useState<Array<VideoChapter>>([]);
  const [ startTime, setStartTime ] = useState<number>(0);

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
        startTime={startTime}
        type={type}
      />

      <ChapterList
        chapters={chapters}
        onChapterClicked={(startTime) => setStartTime(startTime)}
      />
    </>
  );
};

export default MediaPlayerWithChapters;
