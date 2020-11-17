import * as React from "react";
import { useState, useEffect, Fragment } from "react";
import { useParams } from "react-router-dom";
import { VideoJsPlayer } from "video.js";
import usePortal from "react-useportal";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { activateSubtitleTrack, CommonType, convertHMS, EmojiReaction } from "../../util";

import UserLogo, { UserType } from "../user_logo";
import CommentList from "./comment_list";
import Video from "../video";
import NewComment from "./new_comment";
import { TagData } from "../post_list/post_list";
import { getPostId, postComment, postEmojiReaction, postLike } from "../../services/post.service";
import { addEmojiAnimation, addTooltip } from "../videojs/util";
import TranslationModal from "./translation_modal";

interface dataContainerType {
  text_content?: string;
  multimedia?: [{
    id?: string,
    status?: string
  }]
}

export interface PostType extends CommonType {
  title?: string;
  second?: number;
  parent_post_id: string;
  dataContainer?: dataContainerType;
  comments?: PostType[];
  karma_points?: number;
  postReference?: PostType[];
  postReferenced?: PostType[];
  user: UserType;
  userReferenced?: UserType[];
  tags?: TagData[];
}

interface PostProps {
  post?: {
    id: string;
  };
  callbackClickTime?: (s: number) => void;
}

const Post: React.FC<PostProps> = (props) => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const idPost = props.post ? props.post.id : id;
  const { callbackClickTime } = props;
  const { openPortal, closePortal, isOpen, Portal } = usePortal();

  const [post, setPost] = useState<PostType>();
  const [isLike, setIsLike] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(0);
  const [showNewComment, setShowNewComment] = useState<boolean>(false);
  const [comments, setComments] = useState<PostType[]>([]);
  const [emojiReactions, setEmojiReactions] = useState<EmojiReaction[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [player, setPlayer] = useState<VideoJsPlayer>();
  const [showEmojis, setShowEmojis] = useState<boolean>(false);
  const emojis = ["👍","💓","😊","😍","😂","😡"];

  useEffect(() => {
    (async () => {
      const response = await getPostId(idPost);

      if (response.ok) {
        const data = await response.json();

        setPost(data);
        setComments(data.comments);
        setEmojiReactions(data.emojiReactions.map((item: EmojiReaction) => {
          return { emoji: item.emoji, second: item.second };
        }));

        if (!data.parent_post_id) {
          setShowNewComment(true);
          setShowComments(true);
        }

        if (data.isLiked) {
          setIsLike(data.isLiked);
        }

        if (data.likes) {
          setLikes(data.likes);
        }
      }
    })();
  }, [idPost]);

  const handleClickReply = () => {
    setShowNewComment(true);
  };

  const handleClickLike = async () => {
    setIsLike(!isLike);
    const action = isLike ? "unlike" : "like";

    const response = await postLike(idPost, action);

    if (response.ok) {
      const data = await response.json();

      if (data.count || data.count === 0) {
        setLikes(data.count);
      }
    }
  };

  const handleClickComments = () => {
    setShowComments(!showComments);
  };

  const handleSubmitNewComment = async ({ comment, multimedia }: { comment: string, multimedia?: Array<string> }) => {
    const second = player ? player.currentTime() : null;
    const responseComment = (second) ? (
      await postComment(idPost, comment, multimedia, second)
    ) : (
      await postComment(idPost, comment, multimedia)
    );

    if (responseComment.ok) {
      if (player) {
        const resJson = await responseComment.json();
        addTooltip(player, resJson);
      }
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

  const handleClickEmojiButton = () => {
    setShowEmojis(!showEmojis);
  };

  const handleClickEmojiItem = async (emoji: string) => {
    setShowEmojis(false);

    if (player) {
      const second = player.currentTime();
      const response = await postEmojiReaction(idPost, emoji, second);

      if (response.ok) {
        const data = await response.json();
        const reaction: EmojiReaction = {
          emoji: data.emoji,
          second: data.second
        };

        addEmojiAnimation(player, reaction);

        const reactions = [
          reaction,
          ...emojiReactions
        ];

        setEmojiReactions(reactions);
      }
    }
  };

  const handleTranslationSuccess = (languageCode: string, subtitleId: string) => {
    if (player) {
      player.addRemoteTextTrack({
        kind: "subtitles",
        srclang: languageCode,
        src: `/video/subtitles/${subtitleId}`
      }, true);

      activateSubtitleTrack(player, languageCode);
    }
  };

  const handleClickTime = (second: number) => {
    if (player) {
      player.currentTime(second);
    }
  };

  const callbackPlayer = async (newPlayer: VideoJsPlayer) => {
    await setPlayer(newPlayer);
  };

  if (!post) {
    return null;
  }

  return (
    <section className={classNames("section", { "is-comment": post.parent_post_id != undefined })}>
      <div className="container">
        <div className="columns">
          <div className="column">
            <article className="media">
              <UserLogo user={post.user} />

              <div className="media-content">
                <div className="content">
                  <p>
                    {(post.title) && (
                      <strong className="post-title">{post.title}</strong>
                    )}

                    <small className="list-item__date">
                      {post.createdAt && new Date(post.createdAt).toLocaleDateString()}
                    </small>
                    <br />
                    <br />

                    {(post.second) && (
                      <a style={{marginRight: "5px"}} onClick={() => callbackClickTime && callbackClickTime(post.second ? post.second : 0)}>
                        <strong>{convertHMS(post.second)}</strong>
                      </a>
                    )}

                    {post.dataContainer?.text_content}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>

        {(post?.dataContainer?.multimedia && post.dataContainer.multimedia.length > 0) && (
          <div className="columns is-centered">
            <div className="column is-8-desktop is-10-tablet">
              {post.dataContainer.multimedia.map((multimedia, index) => {
                return (
                  <Video
                    key={index}
                    id={multimedia.id}
                    getPlayer={callbackPlayer}
                    comments={comments}
                    emojis={emojiReactions}
                  />
                );
              })}
            </div>
          </div>
        )}

        <div className="columns">
          <div className="column">
            <nav className="level is-mobile" style={{position: "relative"}}>
              <div className="level-left">
                {(post.dataContainer?.multimedia && post.dataContainer?.multimedia.length > 0) && (
                  <Fragment>
                    <div className={`emoji-container ${showEmojis ? "" : "hidden"}`}>
                      {emojis.map((emoji, index) => {
                        return (
                          <button key={index} className="emoji-item" onClick={() => handleClickEmojiItem(emoji)}>{emoji}</button>
                        );
                      })}
                    </div>

                    <a className="level-item button is-info is-small" onClick={handleClickEmojiButton}>
                      <span className="icon is-small">
                        <i className="fas fa-smile"></i>
                      </span>
                    </a>

                    {(!post.parent_post_id) && (
                      <a className="level-item" onClick={(e) => openPortal(e)}>
                        <span className="icon is-small">
                          <i className="fas fa-language"/>
                        </span>
                      </a>
                    )}

                    {isOpen && (
                      <Portal>
                        <TranslationModal
                          id={post.dataContainer.multimedia[0].id!}
                          onSuccess={handleTranslationSuccess}
                          onClose={closePortal}
                        />
                      </Portal>
                    )}
                  </Fragment>
                )}

                <a className="level-item" onClick={handleClickReply}>
                  <span className="icon is-small"><i className="fas fa-reply"></i></span>
                </a>

                <a className="level-item" onClick={handleClickLike}>
                  <span key="unique" className="icon is-small">
                    <i className={ isLike ? "fas fa-heart" : "far fa-heart"} />
                  </span>
                </a>
                <span className="level-item">
                  {likes}
                </span>
              </div>
            </nav>
          </div>
        </div>

        <div className="columns">
          <div className="column">
            {(showNewComment) && (
              <NewComment handleSubmitNewComment={handleSubmitNewComment} handleClickCancel={handleClickCancel}></NewComment>
            )}

            {(!!comments && comments.length > 0) && (
              <a className="text-comments" onClick={handleClickComments}>
                <i className="fas fa-sort-down"></i> {t("Show Comments")} ({comments?.length})
              </a>
            )}

            {(showComments) && (
              <CommentList posts={comments} callbackClickTime={handleClickTime} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Post;