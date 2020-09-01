import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";

export type TagData = {
    id: number;
    tag_name: string;
    createdAt: string;
}
interface TagsProps {}

const Tags: React.FC<TagsProps> = () => {
  const [ tags, setTags ] = useState<Array<TagData>>([]);
  
  useEffect(() => {
    (async () => {
      const res = await fetch("/tags/all", { method: "GET" });

      if (res.ok) {
        const data = await res.json();
        setTags(data);
      }
    })();
  }, []);
    
  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">Tags</h1>
        {tags.map((tag, index) => {
          return (
            <div key={index} className="box">
              <article className="media">
                <div className="media-content">
                  <div className="content">
                    <Link to={`/tag/${tag.id}`}>{tag.tag_name}</Link> 
                    <br />
                    <small><Moment format="DD MMM YYYY">{tag.createdAt}</Moment></small>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tags;