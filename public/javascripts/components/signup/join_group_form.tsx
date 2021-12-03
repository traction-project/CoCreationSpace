import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import classNames from "classnames";

export type UserRole = "participant" | "facilitator" | "moderator" | "admin";

export interface Group {
  id: string;
  name: string;
  groupMembership: {
    role: UserRole;
    approved: boolean;
    roleApproved: boolean;
  }
}

interface GroupSelection {
  id: string;
  name: string;
  status: "joined" | "requested" | "unselected";
}

interface JoinGroupFormProps {
  multiSelect?: boolean;
  onComplete?: () => void;
}

const JoinGroupForm: React.FC<JoinGroupFormProps> = (props) => {
  const { onComplete, multiSelect = true } = props;

  const { t } = useTranslation();
  const [ groups, setGroups ] = useState<Array<GroupSelection>>([]);
  const [ initialGroups, setInitialGroups ] = useState<Array<GroupSelection>>([]);
  const [ error, setError ] = useState<string>();

  useEffect(() => {
    (async () => {
      const groupReq = await fetch("/groups/all");
      const groups: Array<Group> = await groupReq.json();

      const joinedGroupReq = await fetch("/groups/me");
      const joinedGroups: Array<Group> = await joinedGroupReq.json();

      const groupSelection: Array<GroupSelection> = groups.map((g) => {
        const joinedGroup = joinedGroups.find((joined) => joined.id == g.id);

        return {
          id: g.id,
          name: g.name,
          status: (!joinedGroup) ? (
            "unselected"
          ) : (joinedGroup.groupMembership.approved) ? (
            "joined"
          ) : (
            "requested"
          )
        };
      });

      setGroups(groupSelection);
      setInitialGroups(groupSelection);
    })();
  }, []);

  const onGroupSelected = (id: string) => {
    return () => {
      if (multiSelect) {
        setGroups(groups.map((g) => {
          if (g.id == id) {
            return { ...g, status: (g.status == "unselected") ? "joined" : "unselected" };
          }

          return { ...g };
        }));
      } else {
        setGroups(groups.map((g) => {
          if (g.id == id) {
            return { ...g, status: "joined" };
          }

          return { ...g, status: "unselected" };
        }));
      }
    };
  };

  const getGroupsToJoin = () => {
    return groups.filter((g) => {
      // Get initial status of given group
      const initialStatus = initialGroups.find((initial) => initial.id == g.id)!.status;
      // If initial status was unselected and current status is joined, we want to join the group
      return initialStatus == "unselected" && g.status == "joined";
    });
  };

  const getGroupsToLeave = () => {
    return groups.filter((g) => {
      // Get initial status of given group
      const initialStatus = initialGroups.find((initial) => initial.id == g.id)!.status;
      // If initial status was joined and current status is unselected, we want to leave the group
      return initialStatus == "joined" && g.status == "unselected";
    });
  };

  const getRemainingGroups = () => {
    return initialGroups.filter((g) => {
      return g.status == "joined";
    }).filter((g) => {
      // Check if the group is in the groups to leave
      const willLeave = getGroupsToLeave().find((leave) => leave.id == g.id);
      return !willLeave;
    });
  };

  const onSubmit = async () => {
    if (groups.filter((g) => g.status == "joined").length == 0) {
      return;
    }

    try {
      const groupsToJoin = getGroupsToJoin();
      const groupsToLeave = getGroupsToLeave();

      const remainingGroups = getRemainingGroups();

      if (remainingGroups.length == 0) {
        return;
      }

      // Join selected groups
      await Promise.all(groupsToJoin.map((group) => {
        return fetch(`/groups/${group.id}/join`, {
          method: "POST",
        });
      }));

      // Leave all groups which were previously selected, but not anymore
      await Promise.all(groupsToLeave.map((group) => {
        return fetch(`/groups/${group.id}/leave`, {
          method: "POST"
        });
      }));

      const newGroups: Array<GroupSelection> = groups.map((g) => {
        const initialStatus = initialGroups.find((initial) => initial.id == g.id)!.status;

        if (initialStatus == "unselected" && g.status == "joined") {
          return { ...g, status: "requested" };
        }

        return { ...g };
      });

      setGroups(newGroups);
      setInitialGroups(newGroups);
      onComplete?.();
    } catch (err) {
      setError(err);
    }
  };

  // Filter out groups which have a pending join request
  const selectableGroups = groups.filter(({ status }) => {
    return status == "joined" || status == "unselected";
  });

  const pendingGroups = initialGroups.filter(({ status }) => {
    return status == "requested";
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

      {selectableGroups.map(({ id, name, status }) => {
        return (
          <span
            key={id}
            onClick={onGroupSelected(id)}
            className={classNames("tag", "is-large", "is-primary", { "is-light": status == "unselected" })}
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

      <button
        className="button is-info"
        disabled={selectableGroups.filter((g) => g.status == "joined").length == 0 || getRemainingGroups().length == 0}
        onClick={onSubmit}
      >
        {t("Submit")}
      </button>
    </React.Fragment>
  );
};

export default JoinGroupForm;
