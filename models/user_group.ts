import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance } from "./user";
import { TopicInstance } from "./topic";

export interface UserGroupAttributes extends CommonAttributes {
  name: string;
}

type UserGroupCreationAttributes = Optional<UserGroupAttributes, "id" | "createdAt" | "updatedAt">

/**
 * UserGroup instance object interface
 */
export interface UserGroupInstance extends Sequelize.Model<UserGroupAttributes, UserGroupCreationAttributes>, UserGroupAttributes {
  getUsers: Sequelize.BelongsToManyGetAssociationsMixin<UserInstance>;
  countUsers: Sequelize.BelongsToManyCountAssociationsMixin;
  hasUser: Sequelize.BelongsToManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasUsers: Sequelize.BelongsToManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  setUsers: Sequelize.BelongsToManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addUser: Sequelize.BelongsToManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  addUsers: Sequelize.BelongsToManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  removeUser: Sequelize.BelongsToManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>;
  removeUsers: Sequelize.BelongsToManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>;
  createUser: Sequelize.BelongsToManyCreateAssociationMixin<UserInstance>;

  getTopics: Sequelize.HasManyGetAssociationsMixin<TopicInstance>;
  countTopics: Sequelize.HasManyCountAssociationsMixin;
  hasTopic: Sequelize.HasManyHasAssociationMixin<TopicInstance, TopicInstance["id"]>;
  hasTopics: Sequelize.HasManyHasAssociationsMixin<TopicInstance, TopicInstance["id"]>;
  setTopics: Sequelize.HasManySetAssociationsMixin<TopicInstance, TopicInstance["id"]>;
  addTopic: Sequelize.HasManyAddAssociationMixin<TopicInstance, TopicInstance["id"]>;
  addTopics: Sequelize.HasManyAddAssociationsMixin<TopicInstance, TopicInstance["id"]>;
  removeTopic: Sequelize.HasManyRemoveAssociationMixin<TopicInstance, TopicInstance["id"]>;
  removeTopics: Sequelize.HasManyRemoveAssociationsMixin<TopicInstance, TopicInstance["id"]>;
  createTopic: Sequelize.HasManyCreateAssociationMixin<TopicInstance>;
}

/**
 * Build UserGroup model object
 *
 * @param sequelize Sequelize: Conection object with de database
 */
export function UserGroupModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserGroupInstance> {
  //  DB table name
  const TABLE_NAME = "user_groups";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    }
  };

  // Create the model
  const UserGroup = sequelize.define<UserGroupInstance, UserGroupCreationAttributes>("userGroup", attributes, { underscored: true, tableName: TABLE_NAME });
  UserGroup.beforeCreate(group => { group.id = uuidv4(); });

  return UserGroup;
}
