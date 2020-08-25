import * as React from "react";
import UserLogo, { UserType } from "./userLogo";
import { commonType } from "../util";
import CommentList from "./commentList";
import { useState } from "react";
import Video from "./video";
import NewComment from "./new-comment";

type dataContainerType = {
  text_content?: string;
  multimedia?: {
    id?: number
  }
}

type TagType = {
  tagName: string;
}

export type PostType = {
  title?: string;
  dataContainer: dataContainerType;
  childPosts?: PostType[];
  karma_points?: number;
  postReference?: PostType[];
  postReferenced?: PostType[];
  user: UserType;
  userReferenced?: UserType[];
  tags?: TagType[];
} & commonType;

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = (props) => {
  const [ isLike, setIsLike ] = useState<boolean>(false);
  const [ showNewComment, setShowNewComment ] = useState<boolean>(false);
  const [ comments, setComments ] = useState(props.post.childPosts);
  const [ showComments, setShowComments ] = useState(true);
  
  // User post properties
  const user: UserType = props.post.user;

  // Post time properties
  const createdAt = new Date(props.post.created_at);
  let differences = Math.abs(new Date().getTime() - createdAt.getTime());
  const hours = new Date(differences).getHours();
  const min = new Date(differences).getMinutes();
  let time = "";
  time = hours ? `${hours}h ` : time;
  time = min ? `${time}${min}min ` : time;

  // Post content properties
  const { text_content, multimedia } = props.post.dataContainer;

  const handleClickLike = () => {
    setIsLike(!isLike);
    console.log(isLike);
    // Send change to API 
  };

  const handleClickReply = () => {
    console.log(`Reply post ${props.post.id}`);
    setShowNewComment(true);
  };

  const handleClickComments = () => {
    setShowComments(!showComments);
  };
 
  const handleSubmitNewComment = (content: string) => {
    const comment = {
      id: 8,
      user: props.post.user,
      created_at: new Date().toString(),
      updated_at: new Date().toString(),
      dataContainer: {
        text_content: content
      }
    };
    const commentList = comments ? comments.concat(comment) : [comment];
    setComments(commentList);
  };

  const handleClickCancel = () => {
    setShowNewComment(false);
  };

  return (
    <div>
      <div className="comment">
        <article className="media">
          <UserLogo user={user}></UserLogo>
          <div className="media-content">
            <div className="content">
              <p>
                <strong style={{ fontSize: "17px" }}>{user.username}</strong> <small>{time}</small>
              </p>
              { !!multimedia &&
                 <Video id={multimedia.id}></Video>
              }
              { !!text_content && 
                <p>
                  <span>{props.post.dataContainer.text_content}</span>
                </p> 
              }
            </div>
            <nav className="level is-mobile">
              <div className="level-left">
                <a className="level-item" onClick={handleClickReply}>
                  <span className="icon is-small"><i className="fas fa-reply"></i></span>
                </a>
                <a className="level-item" onClick={handleClickLike}>
                  <span key="unique" className="icon is-small">
                    <i className={ isLike ? "fas fa-heart" : "far fa-heart"} />
                  </span>
                </a>
              </div>
            </nav>
          </div>
        </article>
      </div>
      { showNewComment && 
        <NewComment user={user} handleSubmitNewComment={handleSubmitNewComment} handleClickCancel={handleClickCancel}></NewComment>
      }
      { !!comments && comments.length > 0 && <a className="text-comments" onClick={handleClickComments}><i className="fas fa-sort-down"></i> Ver Comentarios ({comments?.length})</a>}
      { showComments && <CommentList posts={comments}></CommentList> }
    </div>
  );
};

export default Post;