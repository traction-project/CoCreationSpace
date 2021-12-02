import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import classNames from "classnames";

export interface Group {
  id: string;
  name: string;
  groupMembership: {
    role: "participant" | "facilitator";
    approved: boolean;
    roleApproved: boolean;
  }
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
  const [ initialGroups, setInitialGroups ] = useState<Array<{ id: string, approved: boolean }>>([]);
  const [ error, setError ] = useState<string>();

  useEffect(() => {
    fetch("/groups/all").then((res) => {
      return res.json();
    }).then((groups: Array<Group>) => {
      setGroups(groups);
      return fetch("/groups/me");
    }).then((res) => {
      return res.json();
    }).then((groups: Array<Group>) => {
      setInitialGroups(groups.map(({ id, groupMembership: { approved } }) => {
        return { id, approved };
      }));

      setSelectedGroups(groups.map((g) => g.id));
    }).catch((err) => {
      setError(err);
    });
  }, []);

  const onGroupSelected = (id: string) => {
    return () => {
      if (multiSelect) {
        const index = selectedGroups.findIndex((groupId) => id == groupId);

        if (index < 0) {
          setSelectedGroups([...selectedGroups, id]);
        } else {
          const groups = selectedGroups.slice();
          groups.splice(index, 1);

          setSelectedGroups(groups);
        }
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
      // Leave all groups which were previously selected, but not anymore
      await Promise.all(initialGroups.filter((initialGroup) => {
        return !selectedGroups.find((selectedGroup) => selectedGroup == initialGroup.id);
      }).map((group) => {
        return fetch(`/groups/${group.id}/leave`, {
          method: "POST"
        });
      }));

      // Join selected groups
      await Promise.all(selectedGroups.map((selectedGroup) => {
        return fetch(`/groups/${selectedGroup}/join`, {
          method: "POST",
        });
      }));

      setInitialGroups(selectedGroups.map((id) => {
        return { id, approved: false };
      }));
      onComplete?.();
    } catch (err) {
      setError(err);
    }
  };

  // Filter out groups which have a pending join request
  const selectableGroups = groups.filter((g) => {
    return initialGroups.find((initialGroup) => {
      return initialGroup.id == g.id && initialGroup.approved == false;
    }) == null;
  });

  const pendingGroups = initialGroups.filter((g) => !g.approved).map((g) => {
    return {
      ...g,
      name: groups.find((existingGroup) => existingGroup.id == g.id)?.name
    };
  });

  return (
    <React.Fragment>
      {error && (
        <article className="message is-danger">
          <div className="message-body">
            <Trans i18nKey="interests-error-unknown">
              <strong>Selection failed!</strong> An unknown error occurred.
            </Trans>
          </div>
        </article>
      )}

      <hr/>

      {selectableGroups.map(({ id, name }) => {
        return (
          <span
            key={id}
            onClick={onGroupSelected(id)}
            className={classNames("tag", "is-large", "is-primary", { "is-light": !selectedGroups.find((groupId) => groupId == id) })}
          >
            {name}
          </span>
        );
      })}

      {(pendingGroups.length > 0) && (
        <>
          <hr/>
          <h6 className="title is-6">{t("Pending requests")}</h6>

          {pendingGroups.map(({ id, name }) => {
            return (
              <span
                key={id}
                className={classNames("tag", "is-large", "is-light", "non-clickable")}
              >
                {name}
              </span>
            );
          })}
        </>
      )}

      <hr/>

      <button className="button is-info" disabled={selectedGroups.length == 0} onClick={onSubmit}>
        {t("Submit")}
      </button>
    </React.Fragment>
  );
};

export default JoinGroupForm;
