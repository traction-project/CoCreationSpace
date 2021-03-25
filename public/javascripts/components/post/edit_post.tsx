import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";

import { PostType } from "./post";
import { getPostId } from "../../services/post.service";

interface EditPostProps {
}

const EditPost: React.FC<EditPostProps> = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { register, handleSubmit } = useForm();
  const { t } = useTranslation();

  const [ post, setPost ] = useState<PostType>();

  useEffect(() => {
    getPostId(id).then((res) => {
      return res.json();
    }).then((data) => {
      setPost(data);
    });
  }, []);

  const handleFormSubmission = handleSubmit(async ({ title, description }) => {
    const res = await fetch(`/posts/${id}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, description
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

              {post.dataContainer?.multimedia &&
               post.dataContainer.multimedia.map((multimedia, index) => {
                 return (
                   <div key={index} className="field">
                     <label className="label">{t("Multimedia")}</label>
                     <div className="control">
                       <p>{multimedia.id}</p>
                     </div>
                   </div>
                 );
               })
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
