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
import PageCounter from "./page_counter";

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
  const [ totalPostCount, setTotalPostCount ] = useState(0);
  const [ selectedTab, setSelectedTab ] = useState<"text" | "media">("text");

  // Parse query string into map
  const filters = parseQueryString(location.search);

  // Fetch posts every time a filter in the query string or the endpoin changes
  useEffect(() => {
    (async () => {
      // Fetch posts with filters applied
      const postsList = await getPosts(filters);

      // Set posts and total post count
      setPosts(postsList.rows);
      setTotalPostCount(postsList.count);
    })();
  }, [endpoint, location.search]);

  /**
   * Fetches a list of posts given a list of filters. Posts can be filtered by
   * group, tags or interests as well as search queries. Moreover, the current
   * result page is also passed as a filter.
   *
   * @param filters Filters that should be applied to the posts to be fetched
   * @returns An object containing the total post count and a list of posts
   */
  const getPosts = async (filters: Map<string, string>): Promise<{ count: number, rows: Array<PostType> }> => {
    // Compose query string from filters
    const queryString = Array.from(filters).map(([k, v]) => {
      return `${k}=${encodeURIComponent(v)}`;
    }).join("&");

    const url = queryString.length > 0 ? `${endpoint}?${queryString}` : endpoint;

    // Make request and return parsed results
    const res = await fetch(url);
    return res.json();
  };

  /**
   * Takes a list of posts and extracts a list of unique, alphabetically sorted
   * interest topics associated to the given posts. The returned list contains
   * the names and IDs of the extracted interest topics.
   *
   * @param posts List of posts to get interests from
   * @returns A sorted list of interest topics alongside their IDs
   */
  const getInterestsFromPosts = (posts: Array<PostType>) => {
    const interests = posts.reduce<Array<InterestData>>((acc, post) => {
      // Extract interest topic ID and name from post
      const { thread: { topic: { id, title } }} = post;

      // Check if given ID is already present
      if (acc.find((i) => i.id == id)) {
        return acc;
      }

      // Add interest topic to output list if not present
      return acc.concat([{
        id, title
      }]);
    }, []);

    // Sort interest topics by name
    return interests.sort(({ title: titleA }, { title: titleB }) => {
      return (titleA < titleB) ? -1 : (titleA > titleB) ? 1 : 0;
    });
  };

  /**
   * Takes a list of posts and extracts a list of unique, alphabetically sorted
   * tags associated to the given posts. The returned list contains the names
   * and IDs of the extracted tags.
   *
   * @param posts List of posts to get tags from
   * @returns A sorted list of tags alongside their IDs
   */
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

  /**
   * Takes a list of posts and extracts a list of unique, alphabetically sorted
   * groups associated to the given posts. The returned list contains the names
   * and IDs of the extracted groups.
   *
   * @param posts List of posts to get groups from
   * @returns A sorted list of groups alongside their IDs
   */
  const getGroupsFromPosts = (posts: Array<PostType>) => {
    const groups = posts.reduce<Array<GroupData>>((acc, post) => {
      const { thread: { topic: { userGroup: { id, name } }}} = post;

      return (acc.find((g) => g.id == id)) ? acc : acc.concat({ id, name });
    }, []);

    return groups.sort(({ name: nameA }, { name: nameB }) => {
      return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
    });
  };

  /**
   * Handle clicking of 'New Post' button by redirecting to the upload page.
   */
  const handleClickButtonNewPost = () => {
    history.push("/upload");
  };

  /**
   * Updates the list of filters applied to the current page by appending them
   * to the query string. This function expects a map of updated filters to be
   * passed as an argument.
   *
   * @param filters Map of updated filters
   */
  const updateFilter = (filters: { [key: string]: string }) => {
    // Composed query string
    const queryString = Object.entries(filters).map(([k, v]) => {
      return `${k}=${v}`;
    }).join("&");

    // Append updated query string to URL
    history.push({ search: `?${queryString}` });
  };

  /**
   * Handles search queries. This function takes a search string and applies it
   * to the current list of filters, or removes the query from the list of
   * if the query is empty.
   *
   * @param q Search query
   */
  const onSearch = (q: string) => {
    // Update filters if query is non-empty
    if (q.length > 0) {
      updateFilter({ ...fromEntries(filters), q: encodeURIComponent(q) });
    } else {
      // Remove query from filters and reset current page to one if query is empty
      filters.delete("q");
      filters.set("page", "1");

      updateFilter(fromEntries(filters));
    }
  };

  // Get groups, interests and tags from the current list of posts
  const groups = getGroupsFromPosts(posts);
  const interests = getInterestsFromPosts(posts);
  const tags = getTagsFromPosts(posts);

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6-desktop is-8-tablet">
            <Filter value={filters.get("q")} searchValueChange={onSearch} placeholder={`${t("Search")}...`}/>
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
              {posts.map((post, index) => {
                return (
                  <React.Fragment key={index}>
                    {(selectedTab == "text") ? (
                      <PostEntry key={index} post={post} />
                    ) : (
                      <PostThumbnailEntry key={index} post={post} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <PageCounter
              page={parseInt(filters.get("page") || "1")}
              perPage={15}
              totalItems={totalPostCount}
              onPageUpdated={(n) => updateFilter({ ...fromEntries(filters), page: n.toString() })}
            />
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
                    filters.set("page", "1");

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
                filters.set("page", "1");

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
                filters.set("page", "1");

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
