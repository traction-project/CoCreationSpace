import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { PostType } from "./post";
import Filter from "./filter";

interface ExploreProps {}

const Explore: React.FC<ExploreProps> = () => {
  const [ posts, setPosts ] = useState<Array<PostType>>([]);
  const endpoint = "/posts/all";

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
    <React.Fragment>
      <div>
        <Filter searchValueChange={handleChange}></Filter>
      </div>
      <div className="columns" style={{ marginTop: 15 }}>
        <div className="column is-8 is-offset-1">
          {posts.map((post, index) => {
            return (
              <div key={index}>
                <Link to={`/post/${post.id}`}>
                  <div className="list-item">
                    <div className="box" style={{width: "100%"}}>
                      <article className="media">
                        <figure className="media-left" style={{width: "min-content", paddingRight: "1rem"}}>
                          <span className="image is-64x64">
                            <img src="https://tecnoduero.com/wp-content/uploads/2017/02/h.png" alt="Logo"/>
                          </span>
                          {post.user && post.user.username ?
                            <p>{post.user.username}</p>
                            : <p>Anonymous</p>
                          }
                        </figure>
                        <div className="media-content">
                          <div className="content">
                            <p>
                              <strong className="post-title">{post.title ? post.title : "Post"}</strong><small className="list-item__date"><Moment format="DD/MM/YYYY">{post.createdAt}</Moment></small>
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
                        <div className="media-right number-comments">
                          <i className="far fa-comment"></i>
                          <p>{(post.comments && post.comments.length > 0) ? post.comments.length : 0} {(post.comments && post.comments.length == 1) ? "Comment" : "Comments" }</p>
                        </div>
                      </article>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Explore;