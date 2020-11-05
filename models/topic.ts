import Sequelize from "sequelize";
import { v4 as uuidv4} from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { ThreadAttributes, ThreadInstance } from "./thread";
import { UserInstance } from "./users";

export interface TopicAttributes extends commonAttributes{
    title: string;
    thread?: ThreadAttributes | ThreadAttributes["id"];
}

/**
 * Topic instance object interface
 */
export interface TopicInstance extends Sequelize.Model<TopicAttributes>, TopicAttributes {
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

  getHasInterests: Sequelize.BelongsToManyGetAssociationsMixin<UserInstance>;
  setHasInterests: Sequelize.BelongsToManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addHasInterests: Sequelize.BelongsToManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  addHasInterest: Sequelize.BelongsToManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  removeHasInterest: Sequelize.BelongsToManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>;
  removeHasInterests: Sequelize.BelongsToManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>;
  hasHasInterest: Sequelize.BelongsToManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasHasInterests: Sequelize.BelongsToManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  countHasInterests: Sequelize.BelongsToManyCountAssociationsMixin;
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
    title: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  };

  // Create the model
  const Topic = sequelize.define<TopicInstance>("topic", attributes, { underscored: true, tableName: TABLE_NAME });

  Topic.beforeCreate(topic => { topic.id = uuidv4(); });

  return Topic;
}
