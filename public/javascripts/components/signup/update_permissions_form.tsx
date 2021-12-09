import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Group, UserRole } from "./join_group_form";

interface RequestableGroup extends Group {
  requested: boolean;
}

interface UpdatePermissionsFormProps {
}

const UpdatePermissionForm: React.FC<UpdatePermissionsFormProps> = (props) => {
  const { t } = useTranslation();
  const [ groups, setGroups ] = useState<Array<RequestableGroup>>([]);

  useEffect(() => {
    fetch("/groups/me/approved").then((res) => {
      return res.json();
    }).then((groups: Array<Group>) => {
      setGroups(groups.map((g) => {
        return { ...g, requested: false };
      }));
    });
  }, []);

  const onPermissionRequested = (groupId: string) => {
    return async () => {
      const group = groups.find((g) => g.id == groupId);

      if (group) {
        const res = await fetch(`/groups/${group.id}/requestrole/${group.groupMembership.role}`, {
          method: "POST"
        });

        if (res.ok) {
          setGroups(groups.map((g) => {
            if (g.id == groupId) {
              return {
                ...g, requested: true
              };
            }

            return g;
          }));
        }
      }
    };
  };

  const onRoleUpdated = (groupId: string) => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      setGroups(groups.map((g) => {
        if (g.id == groupId) {
          return {
            ...g,
            groupMembership: {
              ...g.groupMembership,
              role: e.target.value as UserRole
            }
          };
        }

        return g;
      }));
    };
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
    case "participant":
      return t("The participant is a non-professional artist that participates in tasks that are directed by the facilitator. They are a member of one group, and can see and comment on content within that group. They have permission to edit and delete their own content.");
    case "facilitator":
      return t("The facilitator is a professional artist that sets tasks and gives directions to participants. They are a member of one group, and can download and edit content inside their group, and share it with the permission of participants. In addition, they can see drafts of participant content, but cannot share or edit private content.");
    case "moderator":
      return t("The moderator checks that participants' work is protected and is allowed to download and share content approved by participants and facilitators outside of the Cocreation Space. The moderator’s role is also to flag and remove negative comments from the system, and to change other users' level of permissions.");
    case "admin":
      return t("The administrator makes sure the Cocreation Space is running smoothly. This role has access to download, share, restrict content and change permissions.");
    }
  };

  return (
    <>
      <hr/>

      {groups.map((g) => {
        return (
          <div key={g.id} className="mb-4">
            <h6 className="title is-6">{g.name}</h6>

            <div className="field has-addons">
              <p className="control">
                <span className="select">
                  <select name="role" value={g.groupMembership.role} onChange={onRoleUpdated(g.id)}>
                    <option value="participant">{t("Participant")}</option>
                    <option value="facilitator">{t("Facilitator")}</option>
                    <option value="moderator">{t("Moderator")}</option>
                    <option value="admin">{t("Admin")}</option>
                  </select>
                </span>
              </p>

              <p className="control">
                {(g.requested || !g.groupMembership.roleApproved) ? (
                  <button className="button is-disabled" disabled>
                    {t("Approval pending")}
                  </button>
                ) : (
                  <button className="button is-info" onClick={onPermissionRequested(g.id)}>
                    {t("Request new role")}
                  </button>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default UpdatePermissionForm;
