import * as React from "react";
import { useForm } from "react-hook-form";

import UserLogo, { UserType } from "./userLogo";
import { useState } from "react";
import FileUpload from "./new-comment-file-upload";

type NewCommentProps = {
    user: UserType;
    handleSubmitNewComment: ({comment, multimedia}: {comment: string, multimedia?: Array<number>}) => void;
    handleClickCancel: () => void;
};

const NewComment: React.FC<NewCommentProps> = (props) => {
  const [ files, setFiles ] = useState<Array<File>>([]);
  const [ multimedia, setMultimedia ] = useState<Array<number>>([]);
  const [ loading, setLoading ] = useState<boolean>(false);
  
  const { handleSubmit, register, errors } = useForm();
  const user: UserType = props.user;

  const addFile = (filesToUpload: FileList) => {
    if (filesToUpload && filesToUpload.length > 0) {
      const file = filesToUpload.item(0);

      if (file) {
        let newList = files;
        newList = files.concat(file);
        setFiles(newList);
      }
    }
  };

  const addMultimedia = (multimediaId: number) => {
    const newMultimedia = multimedia;

    newMultimedia.push(multimediaId);
    setMultimedia(newMultimedia);
  };

  const handleClickCancel = () => {
    props.handleClickCancel();
  };

  const handleClickComment = handleSubmit(({ comment }) => {
    const commentContent = {
      comment,
      ...(multimedia && multimedia.length > 0 && {multimedia})
    };
    props.handleSubmitNewComment(commentContent);
  });

  return (
    <React.Fragment>
      <UserLogo user={user}></UserLogo>
      <form onSubmit={handleClickComment}>
        <div className="form-group">
          <textarea
            className={ errors.comment ? "textarea alert" : "textarea"} 
            placeholder="Add a comment..." 
            rows={3}
            name="comment"
            style={{resize: "none"}}
            ref={register({
              required: true
            })}>
          </textarea>
          {errors.comment && <p className="message-warning">* Required</p>} 
        </div>
        {
          (files) ?
            (
              <div className="columns">
                {files.map(((file, index) => {
                  return(
                    <FileUpload key={index} fileToUpload={file} addMultimedia={addMultimedia} setLoading={setLoading}></FileUpload>    
                  );
                }))}
                
              </div>
            ) : null
        }
        <div className="form-group" style={{padding: ".5em 0"}}>
          <button className="button is-info" disabled={loading}>
            Comment
          </button>
          <button 
            onClick={handleClickCancel}
            className="button"
            style={{marginLeft: "5px"}}>
              Cancel
          </button>
          <div className="file">
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
              </span>
            </label>
          </div>
        </div>
      </form>
    </React.Fragment>
  );
};

export default NewComment;