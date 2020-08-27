import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Post from "./post";
import { ThreadData } from "./threads";

interface ThreadProps {}

const Thread: React.FC<ThreadProps> = () => {
  const { id } = useParams();
  const [ thread, setThread ] = useState<ThreadData>();

  useEffect(() => {
    (async () => {
      const res = await fetch(`/threads/id/${id}`, { method: "GET" });

      if (res.ok) {
        const thread = await res.json();
        setThread(thread);
      }
    })();
  }, [id]);

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2 thread">
        <h1 className="title">{thread?.th_title}</h1>
        {(thread && thread.post && thread.post.length > 0) ? 
          <Post post={{ id: thread?.post[0].id }}></Post>
          : null
        }
      </div>        
    </div>
  );
};

export default Thread;