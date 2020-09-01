import * as React from "react";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Moment from "react-moment";

import { TagData } from "./tags";

interface TagProps {}

const Tag: React.FC<TagProps> = () => {
  const { id } = useParams();
  const [ tag, setTag ] = useState<TagData>();

  useEffect(() => {
    (async () => {
      fetch(`/tags/id/${id}`)
        .then(res => res.json())
        .then(data => setTag(data));
    })();
  }, [id]);

  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        {tag ?
          <div>
            <h2 className="list-title">{tag.tag_name}</h2>
            <hr/>
            {tag.post ? 
              tag.post.map((post, index) => {
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
                                  <strong>{post.user.username}</strong>
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
          : null}
      </div>
    </div>
  );
};

export default Tag;