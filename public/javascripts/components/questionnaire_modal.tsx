import * as React from "react";

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
  questions: QuestionnaireQuestions;
  onClose: () => void;
  onComplete: (results: QuestionnaireResults) => void;
}

const QuestionnaireModal: React.FC<QuestionnaireModalProps> = (props) => {
  const { questions, onClose } = props;

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose} />
      <div className="modal-content">
        <div className="box">
          <h4 className="title is-4">{questions.name}</h4>
          <hr/>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireModal;
