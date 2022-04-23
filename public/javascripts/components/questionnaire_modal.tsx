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

interface QuestionnaireQuestions {
  name: string;
  questions: Array<Question>;
}

type QuestionnaireResults = Array<string | number | string[]>;

interface QuestionnaireModalProps {
  questionnaire: QuestionnaireQuestions;
  onClose: () => void;
  onComplete: (results: QuestionnaireResults) => void;
}

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = (props) => {
  const { questionnaire, onClose, onComplete } = props;
  const { handleSubmit, register } = useForm();
  const { t } = useTranslation();

  const onConfirm = handleSubmit(async (data) => {
    onComplete([]);
  });

  const renderQuestion = (q: Question, index: number) => {
    if (q.type == "choice") {
      return (
        <div>
          <h6>{q.question}</h6>
          {q.choices.map((c, i) => {
            return (
              <div key={i}>
                <input value={c} id={`q${index}${i}`} type="radio" {...register(`q${index}`, { required: true })} />
                <label htmlFor={`q${index}${i}`}>{c}</label>
              </div>
            );
          })}
        </div>
      );
    } else if (q.type == "multiple-choice") {
      return (
        <div>
          <h6>{q.question}</h6>
          {q.choices.map((c, i) => {
            return (
              <div key={i}>
                <input value={c} id={`q${index}${i}`} type="checkbox" {...register(`q${index}`, { required: true })} />
                <label htmlFor={`q${index}${i}`}>{c}</label>
              </div>
            );
          })}
        </div>
      );
    } else if (q.type == "likert") {
      return (
        <div>
          <h6>{q.question}</h6>
          {[1, 2, 3, 4, 5, 6, 7].map((c, i) => {
            return (
              <div key={i}>
                <input value={c} id={`q${index}${i}`} type="radio" {...register(`q${index}`, { required: true })} />
                <label htmlFor={`q${index}${i}`}>
                  {(c == 1) ? (
                    q.labels[0]
                  ) : (c == 4) ? (
                    q.labels[1]
                  ) : (
                    q.labels[2]
                  )}
                </label>
              </div>
            );
          })}
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

          <hr/>
          <div className="field is-grouped pt-4">
            <div className="control">
              <button className="button is-link" onClick={onConfirm}>{t("Add")}</button>
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
