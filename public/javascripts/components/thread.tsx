import * as React from "react";
import Post from "./post";

interface ThreadProps {
    th_title: string;
    postId: number;
}

const Thread: React.FC<ThreadProps> = (props) => {
  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2 thread">
        <h1 className="title">{props.th_title}</h1>
        <Post post={{ id: 1, user: { id: 1, username: "Hola" } }}></Post>
      </div>        
    </div>
  );
};

export default Thread;