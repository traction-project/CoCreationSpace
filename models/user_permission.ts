import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface UserPermissionAttributes extends CommonAttributes {
  approved: boolean;
}

type UserPermissionCreationAttributes = Optional<UserPermissionAttributes, "id" | "createdAt" | "updatedAt">

/**
 * UserPermission instance object interface
 */
export interface UserPermissionInstance extends Sequelize.Model<UserPermissionCreationAttributes>, UserPermissionAttributes {
}

/**
 * Build UserPermission model object
 *
 * @param sequelize Sequelize: Database connection object
 */
export function UserPermissionModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserPermissionInstance> {
  //  DB table name
  const TABLE_NAME = "user_permissions";

  // Model attributtes
  const attributes = {
    approved: {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    }
  };

  // Create the model
  const UserPermission = sequelize.define<UserPermissionInstance, UserPermissionCreationAttributes>("userPermission", attributes, { underscored: true, tableName: TABLE_NAME });

  return UserPermission;
}
