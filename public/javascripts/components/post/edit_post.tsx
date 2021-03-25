import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";

import { MultimediaItem, PostType } from "./post";
import { getPostId } from "../../services/post.service";
import Thumbnail from "../thumbnail";

interface EditPostProps {
}

const EditPost: React.FC<EditPostProps> = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { register, handleSubmit } = useForm();
  const { t } = useTranslation();

  const [ post, setPost ] = useState<PostType>();
  const [ multimedia, setMultimedia ] = useState<MultimediaItem[]>([]);

  useEffect(() => {
    getPostId(id).then((res) => {
      return res.json();
    }).then((data) => {
      setPost(data);
      if (data?.dataContainer && data.dataContainer.multimedia) {
        setMultimedia(data.dataContainer.multimedia);
      }
    });
  }, []);

  const handleButtonRemove = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, multimediaId: string) => {
    ev.preventDefault();
    const multimediaFiltered = multimedia.filter(multimedia => multimedia.id !== multimediaId);
    setMultimedia(multimediaFiltered);
  }

  const handleFormSubmission = handleSubmit(async ({ title, description }) => {
    const multimediaIdArray = multimedia.map(m => m.id);
    const res = await fetch(`/posts/${id}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, 
        description, 
        multimedia: multimediaIdArray
      })
    });

    if (res.ok) {
      history.goBack();
    }
  });

  if (!post) {
    return null;
  }

  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-10">
            <h1 className="title">{t("Edit Post")}</h1>

            <form onSubmit={handleFormSubmission}>
              {(post.parent_post_id == null) && (
                <div className="field">
                  <label className="label">{t("Title")}</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      defaultValue={post.title}
                      placeholder={`${t("Add title")}...`}
                      name="title"
                      required={true}
                      ref={register({
                        required: true
                      })}
                    />
                  </div>
                </div>
              )}
              <div className="field">
                <label className="label">{t("Description")}</label>
                <div className="control">
                  <textarea
                    placeholder={`${t("Description")}...`}
                    className="textarea"
                    name="description"
                    defaultValue={post.dataContainer?.text_content}
                    ref={register}
                  />
                </div>
              </div>

              {multimedia.length > 0 && 
                <div className="field is-flex is-flex-wrap-wrap">
                  {multimedia.map((multimedia, index) => {
                    return (
                        <div key={index} className="is-flex is-align-items-center mr-4">
                          <div className="is-flex-grow-0 is-flex-shrink-0">
                            <Thumbnail
                              id={multimedia.id}
                              type={multimedia.type}
                            />
                          </div>
                          <div className="is-flex-grow-0 is-flex-shrink-0">
                            <a className="delete" onClick={(ev) => handleButtonRemove(ev, multimedia.id)}></a>
                          </div>
                        </div>
                    );
                  })}
                </div>
              }
              
              <div className="field pt-4">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-link is-fullwidth"
                  >
                    {t("Submit")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditPost;
