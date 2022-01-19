import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";

import { MultimediaItem, PostType } from "./post";
import { getPostId } from "../../services/post.service";
import { parseTags } from "../../util";
import Thumbnail from "../thumbnail";
import FileUpload from "./new_comment_file_upload";

interface EditPostProps {
}

const EditPost: React.FC<EditPostProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, getValues, setValue, reset } = useForm();
  const { t } = useTranslation();

  const [ post, setPost ] = useState<PostType>();
  const [ multimedia, setMultimedia ] = useState<{id: string, type: string }[]>([]);
  const [ tags, setTags ] = useState<Array<string>>([]);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ fileToUpload, setFileToUpload ] = useState<File>();
  const saveAsDraft = useRef(false);

  useEffect(() => {
    getPostId(id!).then((res) => {
      return res.json();
    }).then((data) => {
      setPost(data);
      setTags(data.tags.map((t: { name: string }) => t.name));

      if (data?.dataContainer && data.dataContainer.mediaItems) {
        const multimediaArray = data.dataContainer.mediaItems.map(
          (m: MultimediaItem) => {
            return {
              id: m.id,
              type: m.type
            };
          }
        );
        setMultimedia(multimediaArray);
      }

      reset();
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
  };

  const addMultimedia = (id: string, type: string) => {
    const newMultimedia = multimedia;

    newMultimedia.push({ id, type });
    setMultimedia(newMultimedia);
  };

  const handleButtonRemove = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>, multimediaId: string) => {
    ev.preventDefault();
    const multimediaFiltered = multimedia.filter(multimedia => multimedia.id !== multimediaId);
    setMultimedia(multimediaFiltered);
  };

  const handleClickRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addTag = (value: string) => {
    if (value.length == 0) {
      return;
    }

    const tagsToAdd = parseTags(value).filter((t) => {
      return tags.indexOf(t) == -1;
    });

    setTags(tags.concat(tagsToAdd));
  };

  const handleFormSubmission = handleSubmit(async ({ title, description }) => {
    const multimediaIdArray = multimedia.map(m => m.id);

    const res = await fetch(`/posts/${id}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        tags,
        multimedia: multimediaIdArray,
        published: !saveAsDraft.current
      })
    });

    if (res.ok) {
      navigate(-1);
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
              {(post.parentPostId == null) && (
                <div className="field">
                  <label className="label">{t("Title")}</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      defaultValue={post.title}
                      placeholder={`${t("Add title")}...`}
                      required={true}
                      {...register("title", {
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
                    defaultValue={post.dataContainer?.textContent}
                    {...register("description")}
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">{t("Tags")}</label>

                <div className="control">
                  <div className="field has-addons">
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        placeholder={`${t("Add tag")}...`}
                        {...register("tagName")}
                      />
                    </div>
                    <div className="control">
                      <button
                        type="button"
                        className="button is-info"
                        onClick={() => {
                          addTag(getValues("tagName"));
                          setValue("tagName", "");
                        }}
                      >
                        {t("Add")}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="list-tags">
                  {(tags.length > 0) ? (
                    <ul>
                      {tags.map((tag, index) => {
                        return (
                          <li key={index} className="tag is-medium is-primary">
                            {tag} <a className="delete" onClick={handleClickRemoveTag.bind(null, tag)}></a>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p>{t("No tags added yet")}</p>
                  )}
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

              <hr/>

              <div className="field pt-4">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-info is-fullwidth"
                    disabled={loading}
                    onClick={() => {
                      saveAsDraft.current = true;
                    }}
                  >
                    {t("Save as draft")}
                  </button>
                </div>
              </div>

              <div className="field pt-4">
                <div className="control">
                  <button
                    type="submit"
                    className="button is-info is-fullwidth"
                    disabled={loading}
                    onClick={() => {
                      saveAsDraft.current = false;
                    }}
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
