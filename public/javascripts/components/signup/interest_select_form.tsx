import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

interface Interest {
  id: string;
  title: string;
  selected: boolean;
}

interface InterestSelectFormProps {
  onComplete: () => void;
}

const InterestSelectForm: React.FC<InterestSelectFormProps> = (props) => {
  const { onComplete } = props;

  const { t } = useTranslation();
  const [ interests, setInterests ] = useState<Array<Interest>>([]);

  useEffect(() => {
    Promise.all([
      fetch("/topics/all"),
      fetch("/users/interests")
    ]).then(([topics, interests]) => {
      return Promise.all([
        topics.json(),
        interests.json()
      ]);
    }).then(([topics, interests]: [Array<Interest>, Array<Interest>]) => {
      setInterests(topics.map((t) => {
        return {
          ...t,
          selected: !!interests.find((i) => i.id == t.id)
        };
      }));
    });
  }, []);

  const onSubmitInterests = async () => {
    await fetch("/users/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topics: interests.filter((i) => i.selected).map((i) => i.id)
      })
    });

    onComplete();
  };

  const onInterestSelected = (id: string) => {
    setInterests(interests.map((interest) => {
      if (interest.id == id) {
        return {
          ...interest,
          selected: !interest.selected
        };
      }

      return interest;
    }));
  };

  return (
    <div className="box">
      <h4 className="title is-4">{t("Select Interests")}</h4>

      <hr/>

      {interests.map(({ id, title, selected }) => {
        return (
          <span
            key={id}
            onClick={onInterestSelected.bind(null, id)}
            className={classNames("tag", "is-large", "is-primary", { "is-light": !selected })}
          >
            {title}
          </span>
        );
      })}

      <hr/>

      <button className="button is-info" onClick={onSubmitInterests}>
        {t("Submit")}
      </button>
    </div>
  );
};

export default InterestSelectForm;
