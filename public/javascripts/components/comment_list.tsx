import * as React from "react";
import Post, { PostType } from "./post";

interface CommentListProps {
    posts?: PostType[];
}

const CommentList: React.FC<CommentListProps> = (props) => {
  
  return (
    <div>
      {props.posts?.map((post, index) => {
        return (<Post key={index} post={post}></Post>);
      })}
    </div>
  );
};

export default CommentList;