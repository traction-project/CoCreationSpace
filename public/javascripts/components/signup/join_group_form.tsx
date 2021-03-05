import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import classNames from "classnames";

interface Group {
  id: string;
  name: string;
}

interface JoinGroupFormProps {
  multiSelect?: boolean;
  onComplete?: () => void;
}

const JoinGroupForm: React.FC<JoinGroupFormProps> = (props) => {
  const { onComplete, multiSelect = false } = props;

  const { t } = useTranslation();
  const [ groups, setGroups ] = useState<Array<Group>>([]);
  const [ selectedGroups, setSelectedGroups ] = useState<Array<string>>([]);
  const [ error, setError ] = useState<string>();

  useEffect(() => {
    fetch("/groups/all").then((res) => {
      return res.json();
    }).then((groups: Array<Group>) => {
      setGroups(groups);
    }).catch((err) => {
      setError(err);
    });
  }, []);

  const onGroupSelected = (id: string) => {
    return () => {
      if (multiSelect) {
        setSelectedGroups(Array.from(
          new Set(
            [...selectedGroups, id]
          )
        ));
      } else {
        setSelectedGroups([id]);
      }
    };
  };

  const onSubmit = async () => {
    if (selectedGroups.length == 0) {
      return;
    }

    try {
      await Promise.all(selectedGroups.map((selectedGroup) => {
        return fetch(`/groups/${selectedGroup}/join`, {
          method: "POST",
        });
      }));

      onComplete?.();
    } catch (err) {
      setError(err);
    }
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

      {groups.map(({ id, name }) => {
        return (
          <span
            key={id}
            onClick={onGroupSelected(id)}
            className={classNames("tag", "is-large", "is-primary", { "is-light": selectedGroups.find((groupId) => groupId == id) })}
          >
            {name}
          </span>
        );
      })}

      <hr/>

      <button className="button is-info" disabled={selectedGroups.length == 0} onClick={onSubmit}>
        {t("Submit")}
      </button>
    </React.Fragment>
  );
};

export default JoinGroupForm;
