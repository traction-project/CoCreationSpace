import * as React from "react";
import Moment from "react-moment";
import UserLogo, { UserType } from "./userLogo";
import { commonType } from "../util";
import CommentList from "./commentList";
import { useState, useEffect } from "react";
import Video from "./video";
import NewComment from "./new-comment";
import { useParams } from "react-router-dom";

type dataContainerType = {
  text_content?: string;
  multimedia?: [{
    id?: number
  }]
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
  post?: {
    id: number;
  };
}

const Post: React.FC<PostProps> = (props) => {
  const { id } = useParams();
  const idPost = props.post ? props.post.id : id;
  const [ post, setPost ] = useState<PostType>();
  const [ isLike, setIsLike ] = useState<boolean>(false);
  const [ showNewComment, setShowNewComment ] = useState<boolean>(false);
  const [ comments, setComments ] = useState<PostType[]>([]);
  const [ showComments, setShowComments ] = useState(false);

  useEffect(() => {
    fetch(`/posts/id/${idPost}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(`Post: ${data.id}`);
        setPost(data);
        setComments(data.comments);
      });
  }, [idPost]);

  const handleClickLike = () => {
    setIsLike(!isLike);
    console.log(isLike);
    // Send change to API
  };

  const handleClickReply = () => {
    setShowNewComment(true);
  };

  const handleClickComments = () => {
    console.log(!showComments);
    setShowComments(!showComments);
  };
 
  const handleSubmitNewComment = ({comment, multimedia}: {comment: string, multimedia?: Array<number>}) => {
    console.log(multimedia);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let bodyJson = {
      text: comment,
      ...(multimedia && multimedia.length > 0 && {multimedia})
    };

    const body = JSON.stringify(bodyJson);

    fetch(`posts/id/${idPost}`,{ 
      method: "POST",
      headers,
      body
    })
      .then((res) => res.json())
      .then((data) => {
        let commentsList = comments;
        commentsList.push(data);
        setComments(commentsList);
        setShowNewComment(false);
      });
  };

  const handleClickCancel = () => {
    setShowNewComment(false);
  };

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        { post ? 
          <div>
            <div className="comment">
              <article className="media">
                <UserLogo user={post.user}></UserLogo>
                <div className="media-content">
                  <div className="content">
                    <p>
                      <strong style={{ fontSize: "17px" }}>{post.user ? post.user.username : "Anónimo"}</strong> <small><Moment fromNow>{post.createdAt}</Moment></small>
                    </p>
                    { post.dataContainer && post.dataContainer.multimedia &&
                      post.dataContainer.multimedia.map((multimedia,index) => {
                        return (
                          <Video key={index} id={multimedia.id}></Video>
                        );
                      })
                      
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
            { !!comments && comments.length > 0 && <a className="text-comments" onClick={handleClickComments}><i className="fas fa-sort-down"></i> Show Comments ({comments?.length})</a>}
            { showComments && <CommentList posts={comments}></CommentList> }
          </div>
          : null}
      </div>        
    </div>
  );
};

export default Post;