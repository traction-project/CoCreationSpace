import * as Sequelize from "sequelize";
import * as uuid from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { ThreadAttributes, ThreadInstance } from "./thread";

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

  Topic.beforeCreate(topic => { topic.id = uuid.v4(); });

  return Topic;
}
