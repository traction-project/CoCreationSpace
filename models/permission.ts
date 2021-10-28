import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserAttributes, UserInstance } from "./user";

export interface PermissionAttributes extends CommonAttributes{
    type: string;
    user?: UserAttributes | UserAttributes["id"];
}

type PermissionCreationAttributes = Optional<PermissionAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Permissions instance object interface
 */
export interface PermissionInstance extends Sequelize.Model<PermissionAttributes, PermissionCreationAttributes>, PermissionAttributes {
  getUsers: Sequelize.BelongsToManyGetAssociationsMixin<UserInstance>;
  countUsers: Sequelize.BelongsToManyCountAssociationsMixin;
  hasUser: Sequelize.BelongsToManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasUsers: Sequelize.BelongsToManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  setUsers: Sequelize.BelongsToManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addUser: Sequelize.BelongsToManyAddAssociationMixin<UserInstance, UserInstance["id"]>
  addUsers: Sequelize.BelongsToManyAddAssociationsMixin<UserInstance, UserInstance["id"]>
  removeUser: Sequelize.BelongsToManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>
  removeUsers: Sequelize.BelongsToManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>
  createUser: Sequelize.BelongsToManyCreateAssociationMixin<UserInstance>
}

/**
 *  Build Permissionss Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function PermissionModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PermissionInstance> {
  //  DB table name
  const TABLE_NAME = "permissions";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    type: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  };

  // Create the model
  const Permission = sequelize.define<PermissionInstance, PermissionCreationAttributes>("Permission", attributes, { underscored: true, tableName: TABLE_NAME });

  Permission.beforeCreate(permission => { permission.id = uuidv4(); });

  return Permission;
}
