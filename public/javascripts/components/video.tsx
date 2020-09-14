import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashPlayer from "./dash_player";

type VideoProps = {
  id?: number
}

const Video: React.FC<VideoProps> = (props) => {
  const { id } = useParams();
  const idAttribute = props.id;
  const idVideo = idAttribute ? idAttribute : id;

  const [ videoUrl, setVideoUrl ] = useState<string | undefined>(undefined);
  const [ availableSubtitles, setAvailableSubtitles ] = useState<Array<{ language: string, url: string }>>([]);

  useEffect(() => {
    fetch(`/video/id/${idVideo}/subtitles`).then((res) => {
      return res.json();
    }).then((data) => {
      setAvailableSubtitles(data.map((s: any) => {
        return {
          language: s.language,
          url: `/video/subtitles/${s.id}`
        };
      }));

      return fetch(`/video/id/${idVideo}`);
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        console.log("Video data:", data);

        setVideoUrl(data.manifest);
      }
    });
  }, [idVideo]);

  return (
    <div style={{ display: "flex" }}>
      {videoUrl ? (
        <DashPlayer
          width={700}
          manifest={videoUrl}
          subtitles={availableSubtitles}
        />
      ) : (
        null
      )}
    </div>
  );
};

export default Video;
