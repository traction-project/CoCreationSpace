import * as React from "react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { PostType } from "../post/post";
import Filter from "./filter";
import PostThumbnailEntry from "./post_thumbnail_entry";
import PostEntry from "./post_entry";

interface PostListProps {
  endpoint: string;
}

export interface TagData {
  id: string;
  tag_name: string;
  createdAt: string;
  post?: PostType[]
}

interface InterestData {
  title: string;
  id: string;
}

interface GroupData {
  name: string;
  id: string;
}

const PostList: React.FC<PostListProps> = ({endpoint}) => {
  const history = useHistory();
  const { t } = useTranslation();

  const [ posts, setPosts ] = useState<Array<PostType>>([]);
  const [ tags, setTags ] = useState<Array<TagData>>();
  const [ interests, setInterests ] = useState<Array<InterestData>>();
  const [ groups, setGroups ] = useState<Array<GroupData>>();

  const [ selectedFilter, setSelectedFilter ] = useState<{ type: "tag" | "interest" | "group", id: string }>();
  const [ selectedTab, setSelectedTab ] = useState<"text" | "media">("text");

  useEffect(() => {
    (async () => {
      const postsList = await getPosts();

      setPosts(postsList);
      getTags(postsList);
      getInterests(postsList);
      getGroups(postsList);
    })();
  }, [endpoint]);

  const getPosts = async (criteria?: string): Promise<Array<PostType>> => {
    const url = criteria ? `${endpoint}?q=${criteria}` : endpoint;

    const res = await fetch(url);
    return res.json();
  };

  const getInterests = (posts: Array<PostType>) => {
    const interests = posts.reduce<Array<InterestData>>((acc, post) => {
      const { thread: { topic: { id, title } }} = post;

      if (acc.find((i) => i.id == id)) {
        return acc;
      }

      return acc.concat([{
        id, title
      }]);
    }, []);

    setInterests(interests);
  };

  const getTags = (posts: Array<PostType>) => {
    const tagsList: Array<TagData> = [];
    posts.forEach((post) => {
      if (post.tags && post.tags.length > 0) {
        post.tags.forEach((tag: TagData) => {
          const isSaved = tagsList.filter(tagSaved => tagSaved.id === tag.id);

          if (!isSaved || isSaved.length == 0) {
            tagsList.push(tag);
          }
        });
      }
    });

    setTags(tagsList);
  };

  const getGroups = (posts: Array<PostType>) => {
    const groups = posts.reduce<Array<GroupData>>((acc, post) => {
      const { thread: { topic: { userGroup: { id, name } }}} = post;

      return (acc.find((g) => g.id == id)) ? acc : acc.concat({ id, name });
    }, []);

    setGroups(groups);
  };

  const handleClickButtonNewPost = () => {
    history.push("/upload");
  };

  const handleClickAllPosts = () => {
    setSelectedFilter(undefined);
  };

  const handleChange = async (value: string) => {
    setSelectedFilter(undefined);

    const postsList: Array<PostType> = await getPosts(value);
    setPosts(postsList);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6-desktop is-8-tablet">
            <Filter searchValueChange={handleChange} placeholder={`${t("Search")}...`}/>
          </div>
        </div>

        <hr/>

        <div className="columns">
          <div className="column is-9">
            <div className="tabs is-centered">
              <ul>
                <li className={classNames({ "is-active": selectedTab == "text" })}>
                  <a onClick={setSelectedTab.bind(null, "text")}>{t("Text")}</a>
                </li>
                <li className={classNames({ "is-active": selectedTab == "media" })}>
                  <a onClick={setSelectedTab.bind(null, "media")}>{t("Media")}</a>
                </li>
              </ul>
            </div>

            <div>
              {posts.filter((post) => {
                if (!selectedFilter) {
                  return true;
                } else if (selectedFilter.type == "interest") {
                  return post.thread.topic.id == selectedFilter.id;
                } else if (selectedFilter.type == "group") {
                  return post.thread.topic.userGroup.id == selectedFilter.id;
                } else {
                  return post.tags?.find((t) => t.id == selectedFilter.id);
                }
              }).map((post, index) => {
                return (
                  <React.Fragment key={index}>
                    {(selectedTab == "text") ? (
                      <PostEntry key={index} post={post} />
                    ) : (
                      <PostThumbnailEntry key={index} post={post} />
                    )}
                    <hr/>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          <div className="column is-2 is-offset-1">
            <button className="button is-info is-fullwidth" onClick={handleClickButtonNewPost}>
              {t("New Post")}
            </button>

            <hr />
            <h6 className="title is-6">{t("Filter by group")}</h6>

            <div>
              {groups?.map((group, index) => {
                return (
                  <span
                    key={index}
                    className={classNames("tag", { "is-primary": selectedFilter?.type == "group" && selectedFilter.id == group.id })}
                    onClick={setSelectedFilter.bind(null, { type: "group", id: group.id })}
                  >
                    {group.name}
                  </span>
                );
              })}
            </div>

            {(selectedFilter?.type == "group") && (
              <a className="is-size-7" onClick={handleClickAllPosts}>
                {t("Clear filter")}
              </a>
            )}

            <hr />
            <h6 className="title is-6">{t("Filter by interest")}</h6>

            <div>
              {interests?.map((interest, index) => {
                return (
                  <span
                    key={index}
                    className={classNames("tag", { "is-primary": selectedFilter?.type == "interest" && selectedFilter.id == interest.id })}
                    onClick={setSelectedFilter.bind(null, { type: "interest", id: interest.id })}
                  >
                    {interest.title}
                  </span>
                );
              })}
            </div>

            {(selectedFilter?.type == "interest") && (
              <a className="is-size-7" onClick={handleClickAllPosts}>
                {t("Clear filter")}
              </a>
            )}

            <hr />
            <h6 className="title is-6">{t("Filter by tag")}</h6>

            <div>
              {tags?.map((tag, index) => {
                return (
                  <span
                    key={index}
                    className={classNames("tag", { "is-primary": selectedFilter?.type == "tag" && selectedFilter.id == tag.id })}
                    onClick={setSelectedFilter.bind(null, { type: "tag", id: tag.id })}
                  >
                    {tag.tag_name}
                  </span>
                );
              })}
            </div>

            {(selectedFilter?.type == "tag") && (
              <a className="is-size-7" onClick={handleClickAllPosts}>
                {t("Clear filter")}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostList;
