import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";

import { PostType } from "./post";
import Filter from "./filter";

interface UserPostProps {}

const UserPost: React.FC<UserPostProps> = () => {
  const [ posts, setPosts ] = useState<Array<PostType>>([]);
  const endpoint = "/posts/all/user";

  useEffect(() => {
    (async () => { getPosts(); })();
  }, []);

  const getPosts = (criteria?: string) => {
    const url = criteria ? `${endpoint}?q=${criteria}` : endpoint;

    fetch(url)
      .then(res => res.json())
      .then(data => { setPosts(data); });
  };

  const handleChange = (value: string) => {
    getPosts(value);
  };

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <div>
          <h2 className="list-title">Posts</h2>
          <br/>
          <div>
            <Filter searchValueChange={handleChange}></Filter>
          </div>
          <hr/>
          {posts ? 
            posts.map((post, index) => {
              return (
                <div key={index}>
                  <Link to={`/post/${post.id}`}>
                    <div className="list-item">
                      <div className="box" style={{width: "12%", padding: "0 1.25rem"}}>
                        <div className="list-item__date">
                          <strong><Moment format="DD/MM/YYYY">{post.createdAt}</Moment></strong>
                        </div>
                      </div>
                      <div className="box" style={{width: "100%"}}>
                        <article className="media">
                          <div className="media-content">
                            <div className="content">
                              <p>
                                { post.user && post.user.username ?
                                  <strong>{post.user.username}</strong>
                                  : <strong>Anonymous</strong>
                                }
                                <br />
                                <br />
                                {post.dataContainer?.text_content}
                              </p>
                            </div>
                            { (post.dataContainer && post.dataContainer.multimedia && post.dataContainer.multimedia.length > 0) ?
                              <div className="list-item__files">
                                {post.dataContainer.multimedia.map((multimedia, index) => {
                                  return (
                                    <div key={index}>
                                      <figure className="image is-24x24 list-item__files-item">
                                        <img src="https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/512/Docs-icon.png"/>
                                      </figure>
                                    </div>
                                  );
                                })}
                              </div>
                              : null}
                          </div>
                        </article>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
            : <p>This tag has not posts</p>}
        </div>
      </div>
    </div>
  );
};

export default UserPost;