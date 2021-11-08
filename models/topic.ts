import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { ThreadAttributes, ThreadInstance } from "./thread";
import { UserInstance } from "./user";
import { UserGroupInstance } from "./user_group";

export interface TopicAttributes extends CommonAttributes{
    title: string;
    thread?: ThreadAttributes | ThreadAttributes["id"];
}

type TopicCreationAttributes = Optional<TopicAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Topic instance object interface
 */
export interface TopicInstance extends Sequelize.Model<TopicAttributes, TopicCreationAttributes>, TopicAttributes {
  getThreads: Sequelize.HasManyGetAssociationsMixin<ThreadInstance>;
  setThreads: Sequelize.HasManySetAssociationsMixin<ThreadInstance, ThreadInstance["id"]>;
  addThreads: Sequelize.HasManyAddAssociationsMixin<ThreadInstance, ThreadInstance["id"]>;
  addThread: Sequelize.HasManyAddAssociationMixin<ThreadInstance, ThreadInstance["id"]>;
  createThread: Sequelize.HasManyCreateAssociationMixin<ThreadInstance>;
  removeThread: Sequelize.HasManyRemoveAssociationMixin<ThreadInstance, ThreadInstance["id"]>;
  removeThreads: Sequelize.HasManyRemoveAssociationsMixin<ThreadInstance, ThreadInstance["id"]>;
  hasThread: Sequelize.HasManyHasAssociationMixin<ThreadInstance, ThreadInstance["id"]>;
  hasThreads: Sequelize.HasManyHasAssociationsMixin<ThreadInstance, ThreadInstance["id"]>;
  countThreads: Sequelize.HasManyCountAssociationsMixin;

  getInterestedUsers: Sequelize.BelongsToManyGetAssociationsMixin<UserInstance>;
  countInterestedUsers: Sequelize.BelongsToManyCountAssociationsMixin;
  hasInterestedUser: Sequelize.BelongsToManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasInterestedUsers: Sequelize.BelongsToManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  setInterestedUsers: Sequelize.BelongsToManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addInterestedUser: Sequelize.BelongsToManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  addInterestedUsers: Sequelize.BelongsToManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  removeInterestedUser: Sequelize.BelongsToManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>;
  removeInterestedUsers: Sequelize.BelongsToManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>;
  createInterestedUser: Sequelize.HasManyCreateAssociationMixin<UserInstance>;

  getUserGroup: Sequelize.BelongsToGetAssociationMixin<UserGroupInstance>;
  setUserGroup: Sequelize.BelongsToSetAssociationMixin<UserGroupInstance, UserGroupInstance["id"]>;
}

/**
 *  Build Topics Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function TopicModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<TopicInstance> {
  //  DB table name
  const TABLE_NAME = "topics";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    title: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    }
  };

  // Create the model
  const Topic = sequelize.define<TopicInstance, TopicCreationAttributes>("topic", attributes, { underscored: true, tableName: TABLE_NAME });

  Topic.beforeCreate(topic => { topic.id = uuidv4(); });

  return Topic;
}
