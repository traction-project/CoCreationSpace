import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import classNames from "classnames";
import usePortal from "react-useportal";

import { CommonType, convertHMS, EmojiReaction } from "../../util";
import UserLogo, { UserType } from "../user_logo";
import CommentList from "./comment_list";
import NewComment from "./new_comment";
import { TagData } from "../post_list/post_list";
import { getPostId, postComment, postLike, getCommentsForItem } from "../../services/post.service";
import Image from "../image";
import Thumbnail from "../thumbnail";
import MediaPlayerWithToolbar from "../media_player_with_toolbar";
import { LoginState } from "../../reducers/login";
import { ApplicationState } from "../../store";
import File from "../file";
import DeletePostModal from "./delete_post_modal";
import NoteIcon from "./note_icon";
import { VideoChapter } from "../media_player_with_chapters";

export interface MultimediaItem {
  id: string;
  status: string;
  type: string;
  emojiReactions: Array<EmojiReaction>;
  videoChapters: VideoChapter[];
  title: string;
  file: string;
  startTime?: number;
}

interface DataContainerType {
  textContent?: string;
  mediaItems?: Array<MultimediaItem>;
}

export interface PostType extends CommonType {
  title?: string;
  second?: number;
  parentPostId: string;
  dataContainer?: DataContainerType;
  comments?: PostType[];
  karmaPoints?: number;
  multimediaRef?: string;
  postReference?: PostType[];
  postReferenced?: PostType[];
  user: UserType;
  thread: {
    id: string,
    title: string,
    topic: {
      id: string,
      title: string,
      userGroup: { id: string, name: string }
    }
  };
  userReferenced?: UserType[];
  tags?: TagData[];
  published: boolean;
}

interface PostConnectedProps {
  login: LoginState;
}

interface PostProps {
  post?: {
    id: string;
  };
  callbackClickTime?: (s: number, multimediaRef: string) => void;
}

const Post: React.FC<PostProps & PostConnectedProps> = (props) => {
  const { t } = useTranslation();
  const history = useHistory();

  const { id } = useParams<{ id: string }>();
  const idPost = props.post ? props.post.id : id;
  const { callbackClickTime, login: { user } } = props;
  const currentTime = useRef(0);
  const { isOpen, openPortal, closePortal, Portal } = usePortal();

  const [post, setPost] = useState<PostType>();
  const [isLike, setIsLike] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(0);
  const [showNewComment, setShowNewComment] = useState<boolean>(false);
  const [comments, setComments] = useState<PostType[]>([]);
  const [selectedItem, setSelectedItem ] = useState<MultimediaItem>();

  useEffect(() => {
    (async () => {
      const response = await getPostId(idPost);

      if (response.ok) {
        const data = await response.json();

        setPost(data);
        setComments(data.comments);
        setSelectedItem(data.dataContainer.mediaItems[0]);

        if (!data.parentPostId) {
          setShowNewComment(true);
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

  const handleSubmitNewComment = async ({ comment, selectedGettimestamp, multimedia }: { comment: string, selectedGettimestamp: boolean, multimedia?: Array<string> }) => {
    const second = currentTime.current;
    const currentItemId = selectedItem?.id;

    const responseComment = (second && currentItemId && selectedGettimestamp) ? (
      await postComment(idPost, comment, multimedia, second, currentItemId)
    ) : (
      await postComment(idPost, comment, multimedia)
    );

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

  const handleClickTime = (second: number, multimediaRef: string) => {
    const foundMediaItem = post?.dataContainer?.mediaItems?.find((mediaItem) => {
      return mediaItem.id == multimediaRef;
    });

    if (foundMediaItem) {
      setSelectedItem({
        ...foundMediaItem,
        startTime: second
      });
    }
  };

  const handleDeletePost = (postDeleted: boolean) => {
    if (postDeleted) {
      history.goBack();
    }
  };

  if (!post) {
    return null;
  }

  return (
    <section className={classNames("section", { "is-comment": post.parentPostId != undefined })}>
      <div className="container">
        <div className="post-entry">
          <div className="columns">
            <div className="column">
              <article className={classNames("media")}>
                <UserLogo user={post.user} />

                <div className="media-content">
                  <div className="content">
                    <div>
                      {(post.title) && (
                        <strong className="post-title">{post.title}</strong>
                      )}

                      <small className="list-item__date">
                        {post.createdAt && new Date(post.createdAt).toLocaleDateString()}&emsp;
                        {post.createdAt && new Date(post.createdAt).toLocaleTimeString()}&emsp;
                        {(post.parentPostId == null) && (
                          <>in <i>{post.thread.topic.userGroup.name}</i>&emsp;</>
                        )}
                        {(user && (user.id == post.user.id || user.admin)) && (
                          <>
                            <Link to={`/post/${post.id}/edit`}>{t("Edit")}</Link>
                            &emsp;
                            <a onClick={openPortal}>{t("Delete")}</a>
                          </>
                        )}
                      </small>

                      <div className="mt-2">
                        {(!post.published) && (
                          <span className="tag is-warning non-clickable mr-2">
                            {t("Draft")}
                          </span>
                        )}

                        {post.tags?.map((t, i) => {
                          return (
                            <span key={i} className="tag is-light non-clickable">
                              {t.name}
                            </span>
                          );
                        })}
                      </div>

                      {(post.second) && (
                        <a style={{marginRight: "5px"}} onClick={() => callbackClickTime && callbackClickTime(post.second ? post.second : 0, post.multimediaRef!)}>
                          <strong>{convertHMS(post.second)}</strong>
                        </a>
                      )}

                      {post.dataContainer?.textContent?.split("\n").map((line, i) => {
                        return (
                          <React.Fragment key={i}>
                            {line}<br/>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          {(selectedItem) && (
            <div className="columns is-centered">
              <div className="column is-8-desktop is-10-tablet" style={{ position: "relative" }}>
                {(selectedItem.type == "video") ? (
                  <MediaPlayerWithToolbar
                    id={selectedItem.id}
                    emojis={selectedItem.emojiReactions}
                    comments={getCommentsForItem(comments, selectedItem)}
                    videoChapters={selectedItem.videoChapters}
                    onTimeUpdate={(time) => currentTime.current = time}
                    startTime={selectedItem.startTime}
                  />
                ) : (selectedItem.type == "audio") ? (
                  <MediaPlayerWithToolbar
                    id={selectedItem.id}
                    emojis={selectedItem.emojiReactions}
                    videoChapters={selectedItem.videoChapters}
                    comments={getCommentsForItem(comments, selectedItem)}
                    onTimeUpdate={(time) => currentTime.current = time}
                    startTime={selectedItem.startTime}
                    type="audio"
                  />
                ) : (selectedItem.type == "image") ? (
                  <Image id={selectedItem.id} showDetectedText={true} />
                ) : (
                  <File id={selectedItem.id} />
                )}

                {(selectedItem.type != "file") && (
                  <p className="has-text-centered mt-2">
                    {selectedItem.file}
                  </p>
                )}

                <NoteIcon id={selectedItem.id} />
              </div>
            </div>
          )}

          {(post.published) && (
            <div className="columns">
              <div className="column">
                <nav className="level is-mobile" style={{position: "relative"}}>
                  <div className="level-left">
                    <a className="level-item" onClick={handleClickReply}>
                      <span className="icon is-small"><i className="fas fa-reply"></i></span>
                    </a>

                    <a className="level-item" onClick={handleClickLike}>
                      <span key="unique" className="icon is-small">
                        <i className={classNames("fa-heart", { "fas": isLike, "far": !isLike })} />
                      </span>
                    </a>
                    <span className="level-item">
                      {likes}
                    </span>
                    {(selectedItem) && (
                      <a href={selectedItem.title} className="level-item" download>
                        <span className="icon is-small">
                          <i className="fas fa-download"/>
                        </span>
                      </a>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          )}

          {(post?.dataContainer?.mediaItems && post.dataContainer.mediaItems.length > 1) && (
            <div style={{ display: "flex", backgroundColor: "#F5F5F5", overflowX: "scroll" }}>
              {post.dataContainer.mediaItems.map((mediaItem, index) => {
                return (
                  <div
                    key={index}
                    className="is-clickable"
                    style={{ flexShrink: 0 }}
                    onClick={setSelectedItem.bind(null, mediaItem)}
                  >
                    <Thumbnail
                      id={mediaItem.id}
                      type={mediaItem.type}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {(post.published) && (
          <div className="columns">
            <div className="column">
              {(showNewComment) && (
                <NewComment
                  handleSubmitNewComment={handleSubmitNewComment}
                  handleClickCancel={handleClickCancel}
                  enableTimestamp={(selectedItem && (selectedItem.type == "video" || selectedItem.type == "audio"))}>
                </NewComment>
              )}

              <CommentList posts={comments} callbackClickTime={handleClickTime} />
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <Portal>
          <DeletePostModal
            id={idPost}
            onDelete={handleDeletePost}
            onClose={closePortal}
          />
        </Portal>
      )}
    </section>
  );
};

function mapStateToProps(state: ApplicationState): PostConnectedProps {
  return {
    login: state.login
  };
}

export default connect(mapStateToProps)(Post);
