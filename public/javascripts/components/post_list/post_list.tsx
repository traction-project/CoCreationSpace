import * as React from "react";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { PostType } from "../post/post";
import Filter from "./filter";
import PostEntry from "./post_entry";

interface PostListProps {
  endpoint: string;
}

export interface TagData {
  id: number;
  tag_name: string;
  createdAt: string;
  post?: PostType[]
}

const PostList: React.FC<PostListProps> = ({endpoint}) => {
  const history = useHistory();
  const { t } = useTranslation();

  const [ posts, setPosts ] = useState<Array<PostType>>([]);
  const [ filteredPosts, setFilteredPosts ] = useState<Array<PostType>>([]);
  const [ tags, setTags ] = useState<Array<TagData>>();
  const [ selectedTag, setSelectedTag ] = useState<number>();

  useEffect(() => {
    (async () => {
      const postsList = (await getPosts()).filter((post) => {
        return post.dataContainer?.multimedia?.every(({ status }) => {
          return status === "done";
        });
      });

      setPosts(postsList);
      setFilteredPosts(postsList);
      getTags(postsList);
    })();
  }, [endpoint]);

  const getPosts = (criteria?: string): Promise<Array<PostType>> => {
    const url = criteria ? `${endpoint}?q=${criteria}` : endpoint;

    return fetch(url)
      .then(res => res.json());
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

  const handleClickButtonNewPost = () => {
    history.push("/upload");
  };

  const handleClickAllPosts = () => {
    setFilteredPosts(posts);
    setSelectedTag(undefined);
  };

  const handleClickTag = (tagSelected: TagData) => {
    const postList: Array<PostType> = [];

    posts.forEach((post) => {
      post.tags?.forEach((tag) => {
        if (tag.id === tagSelected.id) {
          postList.push(post);
        }
      });
    });

    setFilteredPosts(postList);
    setSelectedTag(tagSelected.id);
  };

  const handleChange = async (value: string) => {
    const postsList: Array<PostType> = await getPosts(value);
    setPosts(postsList);
    setFilteredPosts(postsList);
  };

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-6-desktop is-8-tablet">
            <Filter searchValueChange={handleChange} />
          </div>
        </div>

        <hr/>

        <div className="columns" style={{ marginTop: 15 }}>
          <div className="column is-9">
            <div>
              {(filteredPosts) ? (
                filteredPosts.map((post, index) => {
                  return (
                    <React.Fragment key={index}>
                      <PostEntry key={index} post={post} />
                      <hr/>
                    </React.Fragment>
                  );
                })
              ) : (
                <p>{t("This user has not posts")}</p>
              )}
            </div>
          </div>

          <div className="column is-2 is-offset-1">
            <button className="button is-info is-fullwidth" onClick={handleClickButtonNewPost}>
              {t("New Post")}
            </button>

            <hr />
            <h6 className="title is-6">{t("Filter by tag")}</h6>

            <div>
              {tags?.map((tag, index) => {
                return (
                  <span
                    key={index}
                    className={classNames("tag", { "is-primary": tag.id == selectedTag })}
                    onClick={() => handleClickTag(tag)}
                  >
                    {tag.tag_name}
                  </span>
                );
              })}
            </div>

            <a className="is-size-7" onClick={handleClickAllPosts}>
              {t("Clear filter")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostList;
