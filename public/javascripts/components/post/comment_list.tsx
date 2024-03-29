import * as React from "react";
import Post, { PostType } from "./post";

interface CommentListProps {
    posts?: PostType[];
    callbackClickTime?: (s: number, multimediaRef: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({ posts, callbackClickTime }) => {
  return (
    <div>
      {posts?.map((post, index) => {
        return (
          <Post key={index} post={post} callbackClickTime={callbackClickTime} />
        );
      })}
    </div>
  );
};

export default CommentList;
