import * as React from "react";
import { useForm } from "react-hook-form";

import UserLogo, { UserType } from "./userLogo";

type NewCommentProps = {
    user: UserType;
    handleSubmitNewComment: (content: string) => void;
    handleClickCancel: () => void;
};

const NewComment: React.FC<NewCommentProps> = (props) => {
  const { handleSubmit, register, errors } = useForm();
  const user: UserType = props.user;

  const handleClickCancel = () => {
    props.handleClickCancel();
  };

  const handleClickComment = handleSubmit(({ comment }) => {
    props.handleSubmitNewComment(comment);
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
        <div className="form-group" style={{padding: ".5em 0"}}>
          <button className="button is-info">
            Comment
          </button>
          <button 
            onClick={handleClickCancel}
            className="button"
            style={{marginLeft: "5px"}}>
              Cancel
          </button>
        </div>
      </form>
    </React.Fragment>
  );
};

export default NewComment;