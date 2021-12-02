import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface GroupMembershipAttributes extends CommonAttributes {
  approved: boolean;
  role: "participant" | "facilitator";
  roleApproved: boolean;
}

type GroupMembershipCreationAttributes = Optional<GroupMembershipAttributes, "id" | "createdAt" | "updatedAt">

/**
 * GroupMembership instance object interface
 */
export interface GroupMembershipInstance extends Sequelize.Model<GroupMembershipCreationAttributes>, GroupMembershipAttributes {
}

/**
 * Build GroupMembership model object
 *
 * @param sequelize Sequelize: Conection object with de database
 */
export function GroupMembershipModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<GroupMembershipInstance> {
  //  DB table name
  const TABLE_NAME = "user_group_users";

  // Model attributtes
  const attributes = {
    approved: {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    },
    role: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: "participant",
      validate: {
        isIn: [["participant", "facilitator"]]
      }
    },
    roleApproved: {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: true
    }
  };

  // Create the model
  const GroupMembership = sequelize.define<GroupMembershipInstance, GroupMembershipCreationAttributes>("groupMembership", attributes, { underscored: true, tableName: TABLE_NAME });

  return GroupMembership;
}
