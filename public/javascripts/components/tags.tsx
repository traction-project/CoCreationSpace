import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Moment from "react-moment";
import { PostType } from "./post";
import Filter from "./filter";

export type TagData = {
    id: number;
    tag_name: string;
    createdAt: string;
    post?: PostType[]
}
interface TagsProps {}

const Tags: React.FC<TagsProps> = () => {
  const [ tags, setTags ] = useState<Array<TagData>>([]);
  const endpoint = "/tags/all";

  useEffect(() => {
    (async () => { getTags(); })();
  }, []);

  const getTags = (criteria?: string) => {
    const url = criteria ? `${endpoint}?q=${criteria}` : endpoint;

    fetch(url)
      .then(res => res.json())
      .then(data => { setTags(data); });
  };

  const handleChange = (value: string) => {
    getTags(value);
  };
    
  return (
    <div className="columns" style={{ marginTop: 15 }}>
      <div className="column is-8 is-offset-2">
        <h1 className="title">Tags</h1>
        <br/>
        <div>
          <Filter placeholder="Search Tags..."  searchValueChange={handleChange}></Filter>
        </div>
        <hr/>
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