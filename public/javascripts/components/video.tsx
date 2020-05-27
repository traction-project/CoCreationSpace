import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashPlayer from "./dash_player";

const Video: React.FC<{}> = (props) => {
  const { id } = useParams();
  const [ videoUrl, setVideoUrl ] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch(`/video/id/${id}`, { method: "GET"}).then(async (res) => {
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
          {videoUrl ? <DashPlayer width={700} manifest={videoUrl} subtitlePath={`/video/id/${id}/subtitles`} /> : null}
        </div>
      </div>
    </div>
  );
};

export default Video;
