import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Group, UserRole } from "./signup/join_group_form";

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
