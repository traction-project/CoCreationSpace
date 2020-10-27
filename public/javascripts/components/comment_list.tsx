import * as React from "react";
import Post, { PostType } from "./post";

interface CommentListProps {
    posts?: PostType[];
    callbackClickTime?: (s: number) => void;
}

const CommentList: React.FC<CommentListProps> = ({ posts, callbackClickTime }) => {
  return (
    <div>
      {posts?.map((post, index) => {
        return (<Post key={index} post={post} callbackClickTime={callbackClickTime}></Post>);
      })}
    </div>
  );
};

export default CommentList;
