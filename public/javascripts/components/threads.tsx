import * as React from "react";
import { useEffect, useState } from "react";
import { PostType } from "./post";
import { Link } from "react-router-dom";
import Moment from "react-moment";

export type ThreadData = {
    id: number;
    th_title: string;
    createdAt: string;
    post?: Array<PostType>;
    topic_id?: number;
}
interface ThreadsProps {}

const Threads: React.FC<ThreadsProps> = () => {
  const [ threads, setThreads ] = useState<Array<ThreadData>>([]);
  
  useEffect(() => {
    (async () => {
      const res = await fetch("/threads/all", { method: "GET" });

      if (res.ok) {
        const data = await res.json();
        setThreads(data);
      }
    })();
  }, []);
    
  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">Threads</h1>
        {threads.map((thread, index) => {
          return (
            <div key={index} className="box">
              <article className="media">
                <div className="media-content">
                  <div className="content">
                    <Link to={`/thread/${thread.id}`}>{thread.th_title}</Link> 
                    <br />
                    <small><Moment format="DD MMM YYYY">{thread.createdAt}</Moment></small>
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

export default Threads;