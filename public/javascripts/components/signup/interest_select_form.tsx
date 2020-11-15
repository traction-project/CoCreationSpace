import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import classNames from "classnames";

interface Interest {
  id: string;
  title: string;
  selected: boolean;
}

interface InterestSelectFormProps {
  onComplete?: () => void;
  deleteUnselectedInterests?: boolean;
}

const InterestSelectForm: React.FC<InterestSelectFormProps> = (props) => {
  const { onComplete, deleteUnselectedInterests } = props;

  const { t } = useTranslation();
  const [ interests, setInterests ] = useState<Array<Interest>>([]);
  const [ error, setError ] = useState<string>();

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
    }).catch((err) => {
      setError(err);
    });
  }, []);

  const onSubmitInterests = async () => {
    try {
      await fetch("/users/interests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics: interests.filter((i) => i.selected).map((i) => i.id)
        })
      });

      if (deleteUnselectedInterests) {
        console.log("Deleting unselected interests...");

        await fetch("/users/interests", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topics: interests.filter((i) => !i.selected).map((i) => i.id)
          })
        });
      }

      onComplete?.();
    } catch (err) {
      setError(err);
    }
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
    <React.Fragment>
      {error && (
        <article className="message is-danger">
          <div className="message-body">
            <Trans i18nKey="interests-error-unknown">
              <strong>Selection failed!</strong> An onknown error occurred.
            </Trans>
          </div>
        </article>
      )}

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
    </React.Fragment>
  );
};

export default InterestSelectForm;
