import * as React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DashPlayer from "./dash_player";
import { VideoJsPlayer } from "video.js";

type VideoProps = {
  id?: number;
  markers?: number[];
  setPlayer?: (v: VideoJsPlayer) => void;
}

const Video: React.FC<VideoProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const { id: idAttribute, setPlayer, markers } = props;
  const idVideo = idAttribute ? idAttribute : id;

  const [ videoUrl, setVideoUrl ] = useState<string | undefined>(undefined);
  const [ availableSubtitles, setAvailableSubtitles ] = useState<Array<{ language: string, url: string }>>([]);
  const [ videoStatus, setVideoStatus ] = useState<string | undefined>();

  useEffect(() => {
    fetch(`/video/id/${idVideo}/status`).then((res) => {
      return res.json();
    }).then(({ status }) => {
      setVideoStatus(status);

      if (status == "done") {
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

            setVideoUrl(data.manifest);
          }
        });
      }
    });
  }, [idVideo]);

  if (videoStatus === "done") {
    return (
      <div style={{ display: "flex" }}>
        {videoUrl ? (
          <DashPlayer
            width={700}
            manifest={videoUrl}
            subtitles={availableSubtitles}
            markers={markers}
            setPlayer={setPlayer}
          />
        ) : (
          null
        )}
      </div>
    );
  } else {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ width: 700, height: 394, backgroundColor: "#000" }}>
          <p style={{ textAlign: "center", marginTop: "25%", color: "#FFF" }}>
            {videoStatus}
          </p>
        </div>
      </div>
    );
  }
};

export default Video;
