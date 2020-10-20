import * as React from "react";
import Moment from "react-moment";
import UserLogo, { UserType } from "./user_logo";
import { commonType } from "../util";
import CommentList from "./comment_list";
import { useState, useEffect } from "react";
import Video from "./video";
import NewComment from "./new_comment";
import { useParams } from "react-router-dom";
import { TagData } from "./post_list";
import { VideoJsPlayer } from "video.js";
import { getPostId, postComment, postLike } from "../services/post.service";

type dataContainerType = {
  text_content?: string;
  multimedia?: [{
    id?: number,
    status?: string
  }]
}

export type PostType = {
  title?: string;
  second?: number;
  dataContainer?: dataContainerType;
  comments?: PostType[];
  karma_points?: number;
  postReference?: PostType[];
  postReferenced?: PostType[];
  user: UserType;
  userReferenced?: UserType[];
  tags?: TagData[];
} & commonType;

interface PostProps {
  post?: {
    id: number;
  };
}

const Post: React.FC<PostProps> = (props) => {
  const { id } = useParams<{ id: string }>();
  const idPost = props.post ? props.post.id : id;
  const [ post, setPost ] = useState<PostType>();
  const [ isLike, setIsLike ] = useState<boolean>(false);
  const [ likes, setLikes ] = useState<number>(0);
  const [ showNewComment, setShowNewComment ] = useState<boolean>(false);
  const [ comments, setComments ] = useState<PostType[]>([]);
  const [ showComments, setShowComments ] = useState(false);
  const [ player, setPlayer ] = useState<VideoJsPlayer>();

  useEffect(() => {( async () => {
    const response = await getPostId(idPost);

    if (response.ok) {
      const data = await response.json();
      setPost(data);
      setComments(data.comments);
      if (!data.parent_post_id) {
        setShowNewComment(true);
        setShowComments(true);
      }
      if (data.isLiked) { setIsLike(data.isLiked); }
      if (data.likes) { setLikes(data.likes); }
    }
  })();
  }, [idPost]);

  const handleClickReply = () => {
    setShowNewComment(true);
  };

  const handleClickLike = async () => {
    const action = isLike ? "unlike" : "like";
    const response = await postLike(idPost, action);

    if (response.ok) {
      const data = await response.json();

      if (data.count || data.count === 0) {
        setLikes(data.count);
      }
    }
    setIsLike(!isLike);
  };

  const handleClickComments = () => {
    setShowComments(!showComments);
  };

  const handleSubmitNewComment = async ({comment, multimedia}: {comment: string, multimedia?: Array<number>}) => {
    const second = player ? player.currentTime() : 0;
    const responseComment = await postComment(idPost, comment, multimedia, second);

    if (responseComment.ok) {
      const responsePost = await getPostId(idPost);

      if (responsePost.ok) {
        const data = await responsePost.json();
        setPost(data);
        setComments(data.comments);
      }
    }
  };

  const handleClickCancel = () => {
    setShowNewComment(false);
  };

  const callbackPlayer = async (newPlayer: VideoJsPlayer) => {
    await setPlayer(newPlayer);
  };

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-1">
        { post ?
          <div>
            <div className="comment">
              <article className="media">
                <UserLogo user={post.user}></UserLogo>
                <div className="media-content">
                  <div className="content">
                    <p>
                      <strong className="post-title">{post.title ? post.title : "Post"}</strong><small className="list-item__date"><Moment format="DD/MM/YYYY">{post.createdAt}</Moment></small>
                      <br />
                      <br />
                      {post.dataContainer?.text_content}
                    </p>
                    { post.dataContainer && post.dataContainer.multimedia &&
                      post.dataContainer.multimedia.map((multimedia,index) => {
                        return (
                          <Video key={index} id={multimedia.id} getPlayer={callbackPlayer} comments={comments}></Video>
                        );
                      })
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
                      <span className="level-item">{likes}</span>
                    </div>
                  </nav>
                  { showNewComment &&
                    <NewComment handleSubmitNewComment={handleSubmitNewComment} handleClickCancel={handleClickCancel}></NewComment>
                  }
                  { !!comments && comments.length > 0 && <a className="text-comments" onClick={handleClickComments}><i className="fas fa-sort-down"></i> Show Comments ({comments?.length})</a>}
                  { showComments && <CommentList posts={comments}></CommentList> }
                </div>
              </article>
            </div>
          </div>
          : null}
      </div>
    </div>
  );
};

export default Post;
