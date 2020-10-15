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
  const [ filteredComments, setFilteredComments ] = useState<PostType[]>([]);
  const [ showComments, setShowComments ] = useState(true);
  const [ player, setPlayer ] = useState<VideoJsPlayer>();

  useEffect(() => {
    fetch(`/posts/id/${idPost}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setComments(data.comments);
        filterCommentsByTime(data.comments);
        if (data.isLiked) { setIsLike(data.isLiked); }
        if (data.likes) { setLikes(data.likes); }
      });
  }, [idPost]);

  const handleClickLike = () => {
    const action = isLike ? "unlike" : "like";
    postLike(action);
    setIsLike(!isLike);
  };

  const postLike = (action: string) => {
    action = action.toLowerCase();
    fetch(`/posts/id/${idPost}/${action}`, { method: "POST" })
      .then(res => res.json())
      .then((data) => {
        if (data.count || data.count === 0) {
          setLikes(data.count);
        }
      });
  };

  const handleClickReply = () => {
    setShowNewComment(true);
  };

  const getPlayer = async (newPlayer: VideoJsPlayer) => {
    newPlayer.on("timeupdate", () => {
      const timeRounded = Math.floor(newPlayer.currentTime());
      filterCommentsByTime(comments, timeRounded);
    });

    newPlayer.play();
    await setPlayer(newPlayer);
  };

  const handleClickComments = () => {
    setShowComments(!showComments);
  };

  const handleSubmitNewComment = ({comment, multimedia}: {comment: string, multimedia?: Array<number>}) => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    let bodyJson = {
      text: comment,
      ...(multimedia && multimedia.length > 0 && {multimedia})
    };

    if (player) {
      const second = player.currentTime();
      Object.assign(bodyJson, { second });
    }

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
        const timeRounded = player ? Math.floor(player.currentTime()) : 0;
        filterCommentsByTime(commentsList, timeRounded);
        setShowNewComment(false);
      });
  };

  const handleClickCancel = () => {
    setShowNewComment(false);
  };

  const filterCommentsByTime = (comments: PostType[], second = 0): void => {
    const list = comments.filter((comment) => !comment.second || Math.floor(comment.second) <= second);

    list.sort((a, b) => {
      if (!a.second || !b.second) {
        return -1;
      }
      return Math.floor(b.second) - Math.floor(a.second);
    });

    setFilteredComments(list);
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
                          <Video key={index} id={multimedia.id} setPlayer={getPlayer} markers={comments && comments.map(comment => comment.second ? comment.second : 0)} comments={comments}></Video>
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
                  { !!filteredComments && filteredComments.length > 0 && <a className="text-comments" onClick={handleClickComments}><i className="fas fa-sort-down"></i> Show Comments ({filteredComments?.length})</a>}
                  { showComments && <CommentList posts={filteredComments}></CommentList> }
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
