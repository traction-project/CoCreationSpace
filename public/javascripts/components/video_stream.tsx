import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface VideoData {
  id: string;
  title: string;
  resolutions?: Array<number>;
  duration?: number;
  status: string;
  mainThumbnail?: string;
}

interface VideoStreamProps {
}

const VideoStream: React.FC<VideoStreamProps> = (props) => {
  const [ videos, setVideos ] = useState<Array<VideoData>>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/video/all", { method: "GET" });

      if (res.ok) {
        const data = await res.json();
        setVideos(data);
      }
    })();
  }, []);

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">Videos</h1>
        {videos.map((v, i) => {
          return (
            <div key={i} className="box">
              <article className="media">
                <div className="media-left">
                  <figure className="image is-128x128">
                    {(v.mainThumbnail) ? (
                      <img src={v.mainThumbnail} style={{ maxWidth: 128, maxHeight: 128}} alt="Image" />
                    ) : null}
                  </figure>
                </div>
                <div className="media-content">
                  <div className="content">
                    {(v.status === "done") ? (
                      <Link to={`/video/${v.id}`}>{v.title}</Link>
                    ) : (
                      v.title
                    )}
                    <hr />
                    <b>Available resolutions:</b> {v.resolutions && v.resolutions.join(", ")}<br />
                    <b>Duration:</b> {v.duration || "?"}s<br />
                    <b>Status:</b> {v.status}
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoStream;
