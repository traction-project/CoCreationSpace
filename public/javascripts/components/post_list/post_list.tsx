import * as React from "react";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { fromEntries, parseQueryString } from "../../util";
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
  const location = useLocation();
  const { t } = useTranslation();

  const [ posts, setPosts ] = useState<Array<PostType>>([]);
  const [ selectedTab, setSelectedTab ] = useState<"text" | "media">("text");

  const filters = parseQueryString(location.search);

  useEffect(() => {
    (async () => {
      const postsList = await getPosts();
      setPosts(postsList);
    })();
  }, [endpoint]);

  const getPosts = async (criteria?: string): Promise<Array<PostType>> => {
    const url = criteria ? `${endpoint}?q=${criteria}` : endpoint;

    const res = await fetch(url);
    return res.json();
  };

  const getInterestsFromPosts = (posts: Array<PostType>) => {
    const interests = posts.reduce<Array<InterestData>>((acc, post) => {
      const { thread: { topic: { id, title } }} = post;

      if (acc.find((i) => i.id == id)) {
        return acc;
      }

      return acc.concat([{
        id, title
      }]);
    }, []);

    return interests.sort(({ title: titleA }, { title: titleB }) => {
      return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0;
    });
  };

  const getTagsFromPosts = (posts: Array<PostType>) => {
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

    return tagsList.sort(({ tag_name: tagA }, { tag_name: tagB }) => {
      return (tagA < tagB) ? -1 : (tagA > tagB) ? 1 : 0;
    });
  };

  const getGroupsFromPosts = (posts: Array<PostType>) => {
    const groups = posts.reduce<Array<GroupData>>((acc, post) => {
      const { thread: { topic: { userGroup: { id, name } }}} = post;

      return (acc.find((g) => g.id == id)) ? acc : acc.concat({ id, name });
    }, []);

    return groups.sort(({ name: nameA }, { name: nameB }) => {
      return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
    });
  };

  const handleClickButtonNewPost = () => {
    history.push("/upload");
  };

  const updateFilter = (filters: { [key: string]: string }) => {
    const queryString = Object.entries(filters).map(([k, v]) => {
      return `${k}=${v}`;
    }).join("&");

    history.push({ search: `?${queryString}` });
  };

  const handleChange = async (value: string) => {
    const postsList: Array<PostType> = await getPosts(value);
    setPosts(postsList);
  };

  const groups = getGroupsFromPosts(posts);
  const interests = getInterestsFromPosts(posts);
  const tags = getTagsFromPosts(posts);

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
                return (filters.has("group")) ? (
                  post.thread.topic.userGroup.id == filters.get("group")
                ) : (
                  true
                );
              }).filter((post) => {
                return (filters.has("interest")) ? (
                  post.thread.topic.id == filters.get("interest")
                ) : (
                  true
                );
              }).filter((post) => {
                return (filters.has("tag")) ? (
                  post.tags?.find((t) => t.id == filters.get("tag"))
                ) : (
                  true
                );
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

            {(groups && groups.length > 1) && (
              <>
                <hr />
                <h6 className="title is-6">{t("Filter by group")}</h6>

                <div>
                  {groups?.map((group, index) => {
                    return (
                      <span
                        key={index}
                        className={classNames("tag", { "is-primary": filters.has("group") && filters.get("group") == group.id })}
                        onClick={updateFilter.bind(null, { ...fromEntries(filters), group: group.id })}
                      >
                        {group.name}
                      </span>
                    );
                  })}
                </div>

                {(filters.has("group")) && (
                  <a className="is-size-7" onClick={() => {
                    filters.delete("group");
                    updateFilter(fromEntries(filters));
                  }}>
                    {t("Clear filter")}
                  </a>
                )}
              </>
            )}

            <hr />
            <h6 className="title is-6">{t("Filter by interest")}</h6>

            <div>
              {interests.map((interest, index) => {
                return (
                  <span
                    key={index}
                    className={classNames("tag", { "is-primary": filters.has("interest") && filters.get("interest") == interest.id })}
                    onClick={updateFilter.bind(null, { ...fromEntries(filters), interest: interest.id })}
                  >
                    {interest.title}
                  </span>
                );
              })}
            </div>

            {(filters.has("interest")) && (
              <a className="is-size-7" onClick={() => {
                filters.delete("interest");
                updateFilter(fromEntries(filters));
              }}>
                {t("Clear filter")}
              </a>
            )}

            <hr />
            <h6 className="title is-6">{t("Filter by tag")}</h6>

            <div>
              {tags.map((tag, index) => {
                return (
                  <span
                    key={index}
                    className={classNames("tag", { "is-primary": filters.has("tag") && filters.get("tag") == tag.id })}
                    onClick={updateFilter.bind(null, { ...fromEntries(filters), tag: tag.id })}
                  >
                    {tag.tag_name}
                  </span>
                );
              })}
            </div>

            {(filters.has("tag")) && (
              <a className="is-size-7" onClick={() => {
                filters.delete("tag");
                updateFilter(fromEntries(filters));
              }}>
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
