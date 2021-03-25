import * as React from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams, useHistory } from "react-router-dom";

import { MultimediaItem, PostType } from "./post";
import { getPostId } from "../../services/post.service";
import Thumbnail from "../thumbnail";
import FileUpload from "./new_comment_file_upload";

interface EditPostProps {
}

const EditPost: React.FC<EditPostProps> = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { register, handleSubmit } = useForm();
  const { t } = useTranslation();

  const [ post, setPost ] = useState<PostType>();
  const [ multimedia, setMultimedia ] = useState<{id: string, type: string }[]>([]);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ fileToUpload, setFileToUpload ] = useState<File>()

  useEffect(() => {
    getPostId(id).then((res) => {
      return res.json();
    }).then((data) => {
      setPost(data);
      if (data?.dataContainer && data.dataContainer.multimedia) {
        const multimediaArray = data.dataContainer.multimedia.map(
          (m: MultimediaItem) => { 
            return { 
              id: m.id, 
              type: m.type 
            } 
          }
        );
        setMultimedia(multimediaArray);
      }
    });
  }, []);

  const addFile = async (filesToUpload: FileList) => {
    if (filesToUpload && filesToUpload.length > 0) {
      const file = filesToUpload.item(0);

      if (file) {
        setFileToUpload(file);
        setLoading(true);
      }
    }
  }

  const addMultimedia = (id: string, type: string) => {
    const newMultimedia = multimedia;

    newMultimedia.push({ id, type });
    setMultimedia(newMultimedia);
  };

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
                <>
                  <label className="label">{t("Media")}</label> 
                  <div className="field is-flex is-flex-wrap-wrap">
                    {multimedia.map((multimedia) => {
                      return (
                          <div key={multimedia.id} className="box is-flex is-flex-direction-column is-align-items-center" style={{marginBottom: "1.5rem"}}>
                            <Thumbnail
                              id={multimedia.id}
                              type={multimedia.type}
                            />
                            <a onClick={(ev) => handleButtonRemove(ev, multimedia.id)}>
                              <span className="icon is-medium">
                                <i className="fas fa-trash fa-lg"></i>
                              </span>
                            </a>
                          </div>
                      );
                    })}
                  </div>
                </>
              }

              {fileToUpload && loading &&
                <FileUpload fileToUpload={fileToUpload} addMultimedia={addMultimedia} setLoading={setLoading} />
              }

              <div className="file is-primary">
                <label className="file-label">
                  <input
                    onChange={e => { e.target.files && addFile(e.target.files); }}
                    className="file-input"
                    type="file"
                    name="resume"
                  />
                  <span className="file-cta">
                    <span className="file-icon">
                      <i className="fas fa-upload"></i>
                    </span>
                    <span className="file-label" style={{marginLeft: "1rem"}}>
                      {t("Upload new file")}
                    </span>
                  </span>
                </label>
              </div>
              
              <div className="field pt-4">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-link is-fullwidth"
                    disabled={loading}
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
