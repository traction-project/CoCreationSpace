import * as React from "react";
import UserLogo, { UserType } from "./userLogo";
import { commonType } from "../util";
import CommentList from "./commentList";
import { useState, useEffect } from "react";
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
  dataContainer?: dataContainerType;
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
  const { id } = props.post;
  const [ post, setPost ] = useState<PostType>();
  const [ isLike, setIsLike ] = useState<boolean>(false);
  const [ showNewComment, setShowNewComment ] = useState<boolean>(false);
  const [ comments, setComments ] = useState<PostType[]>([]);
  const [ showComments, setShowComments ] = useState(true);

  useEffect(() => {
    fetch(`/posts/id/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(`Post: ${data.id}`);
        setPost(data);
        setComments(data.comments);
      });
  }, [id]);

  const calculateTime = (post: PostType): string => {
    if (!post.createdAt) return "";

    const createdAt = new Date(post.createdAt);
    let differences = Math.abs(new Date().getTime() - createdAt.getTime());
    const days = new Date(differences).getDay();
    const hours = new Date(differences).getHours();
    const min = new Date(differences).getMinutes();
    let time = "";
    time = days ? `${days}d` : time;
    time = hours ? `${hours}h ` : time;
    time = min ? `${time}${min}min ` : time;
    return time;
  };

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
    const comment: PostType = {
      id: 8,
      user: props.post.user,
      dataContainer: {
        text_content: content
      }
    };
    let commentList = comments;
    commentList.push(comment);
    setComments(commentList);
  };

  const handleClickCancel = () => {
    setShowNewComment(false);
  };

  return (
    <React.Fragment>
      { post ? 
        <div>
          <div className="comment">
            <article className="media">
              <UserLogo user={post.user}></UserLogo>
              <div className="media-content">
                <div className="content">
                  <p>
                    <strong style={{ fontSize: "17px" }}>{post.user.username}</strong> <small>{calculateTime(post)}</small>
                  </p>
                  { post.dataContainer && post.dataContainer.multimedia &&
                    <Video id={post.dataContainer.multimedia.id}></Video>
                  }
                  { post.dataContainer && post.dataContainer.text_content && 
                    <p>
                      <span>{post.dataContainer.text_content}</span>
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
            <NewComment user={post.user} handleSubmitNewComment={handleSubmitNewComment} handleClickCancel={handleClickCancel}></NewComment>
          }
          { !!comments && comments.length > 0 && <a className="text-comments" onClick={handleClickComments}><i className="fas fa-sort-down"></i> Ver Comentarios ({comments?.length})</a>}
          { showComments && <CommentList posts={comments}></CommentList> }
        </div>
        : null}
    </React.Fragment> 
    
  );
};

export default Post;