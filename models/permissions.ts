import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { UsersAttributes, UserInstance } from "./users";

export interface PermissionsAttributes extends commonAttributes{
    type: string;
    user?: UsersAttributes | UsersAttributes["id"];
}

type PermissionsCreationAttributes = Optional<PermissionsAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Permissions instance object interface
 */
export interface PermissionsInstance extends Sequelize.Model<PermissionsAttributes, PermissionsCreationAttributes>, PermissionsAttributes {
  getUsers: Sequelize.HasManyGetAssociationsMixin<UserInstance>;
  setUsers: Sequelize.HasManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addUsers: Sequelize.HasManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  addUser: Sequelize.HasManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  hasUser: Sequelize.HasManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasUsers: Sequelize.HasManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  countUsers: Sequelize.HasManyCountAssociationsMixin;
}

/**
 *  Build Permissionss Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function PermissionsModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PermissionsInstance> {
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
  const Permissions = sequelize.define<PermissionsInstance, PermissionsCreationAttributes>("permissions", attributes, { underscored: true, tableName: TABLE_NAME });

  Permissions.beforeCreate(permission => { permission.id = uuidv4(); });

  return Permissions;
}
