import * as React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";

interface ChoiceQuestion {
  type: "choice",
  question: string;
  choices: Array<string>;
}

interface MultipleChoiceQuestion {
  type: "multiple-choice",
  question: string;
  choices: Array<string>;
}

interface LikertQuestion {
  type: "likert",
  question: string;
  scale: number;
  labels: Array<string>;
}

type Question = ChoiceQuestion | MultipleChoiceQuestion | LikertQuestion;

export interface Questionnaire {
  name: string;
  questions: Array<Question>;
}

interface QuestionnaireResults {
  [key: string]: string;
}

interface QuestionnaireModalProps {
  questionnaire: Questionnaire;
  onClose: () => void;
  onComplete: (results: QuestionnaireResults) => void;
}

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = (props) => {
  const { questionnaire, onClose, onComplete } = props;
  const { handleSubmit, register } = useForm();
  const { t } = useTranslation();

  const onConfirm = handleSubmit(async (data) => {
    onComplete(data);
    onClose();
  });

  const renderQuestion = (q: Question, index: number) => {
    if (q.type == "choice") {
      return (
        <div key={index}>
          <h5 className="title is-5">{q.question}</h5>
          {q.choices.map((c, i) => {
            return (
              <div key={i} className="control">
                <label>
                  <input value={c} type="radio" {...register(`q${index + 1}`, { required: true })} />
                  &nbsp;{c}
                </label>
              </div>
            );
          })}
          <hr/>
        </div>
      );
    } else if (q.type == "multiple-choice") {
      return (
        <div key={index}>
          <h5 className="title is-5">{q.question}</h5>
          {q.choices.map((c, i) => {
            return (
              <div key={i} className="control">
                <label>
                  <input value={c} type="checkbox" {...register(`q${index + 1}`, { required: true })} />
                  &nbsp;{c}
                </label>
              </div>
            );
          })}
          <hr/>
        </div>
      );
    } else if (q.type == "likert") {
      return (
        <div key={index}>
          <h5 className="title is-5">{q.question}</h5>
          {[1, 2, 3, 4, 5, 6, 7].map((c, i) => {
            return (
              <div key={i} className="control">
                <label>
                  <input value={c} type="radio" {...register(`q${index + 1}`, { required: true })} />
                  &nbsp;{c}.&nbsp;
                  {(c == 1) ? (
                    q.labels[0]
                  ) : (c == 4) ? (
                    q.labels[1]
                  ) : (c == 7) ? (
                    q.labels[2]
                  ) : (
                    ""
                  )}
                </label>
              </div>
            );
          })}
          <hr/>
        </div>
      );
    }
  };

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <h4 className="title is-4">{questionnaire.name}</h4>
          <hr/>

          {questionnaire.questions.map((q, i) => {
            return renderQuestion(q, i);
          })}

          <div className="field is-grouped pt-4">
            <div className="control">
              <button className="button is-link" onClick={onConfirm}>{t("Submit")}</button>
            </div>
            <div className="control">
              <button className="button is-link is-light" onClick={onClose}>{t("Cancel")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireModal;
