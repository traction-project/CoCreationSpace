import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashPlayer from "./dash_player";

const Video: React.FC<{}> = (props) => {
  const { id } = useParams();

  const [ videoUrl, setVideoUrl ] = useState<string | undefined>(undefined);
  const [ availableSubtitles, setAvailableSubtitles ] = useState<Array<{ language: string, url: string }>>([]);

  useEffect(() => {

    fetch(`/video/id/${id}/subtitles`).then(async (res) => {
      if (res.ok) {
        const data = await res.json();

        setAvailableSubtitles(data.map((s: any) => {
          return {
            language: s.language,
            url: `/video/subtitles/${s.id}`
          };
        }));
      }

      return fetch(`/video/id/${id}`);
    }).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        console.log("Video data:", data);

        setVideoUrl(data.manifest);
      }
    });
  }, []);

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">{id}</h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
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
      </div>
    </div>
  );
};

export default Video;
