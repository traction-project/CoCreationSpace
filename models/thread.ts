import * as Sequelize from "sequelize";
import * as uuid from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { TopicAttributes, TopicInstance } from "./topic";
import { PostAttributes, PostInstance } from "./post";

export interface ThreadAttributes extends commonAttributes{
    th_title: string;
    topic?: TopicAttributes | TopicAttributes["id"];
    post?: PostAttributes | PostAttributes["id"];
}

/**
 * Thread instance object interface
 */
export interface ThreadInstance extends Sequelize.Model<ThreadAttributes>, ThreadAttributes {
  getTopic: Sequelize.BelongsToGetAssociationMixin<TopicInstance>;
  setTopic: Sequelize.BelongsToSetAssociationMixin<TopicInstance, TopicInstance["id"]>

  getPost: Sequelize.HasManyGetAssociationsMixin<PostInstance>;
  setPost: Sequelize.HasManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPosts: Sequelize.HasManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPost: Sequelize.HasManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  createPost: Sequelize.HasManyCreateAssociationMixin<PostInstance>;
  removePost: Sequelize.HasManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePosts: Sequelize.HasManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPost: Sequelize.HasManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPosts: Sequelize.HasManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPosts: Sequelize.HasManyCountAssociationsMixin;
}

/**
 *  Build Thread Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function ThreadModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<ThreadInstance> {
  //  DB table name
  const TABLE_NAME = "threads";
  // Model attributtes
  const attributes = {
    th_title: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    }
  };

  // Create the model
  const Thread = sequelize.define<ThreadInstance>("thread", attributes, { underscored: true, tableName: TABLE_NAME });

  Thread.beforeCreate(thread => { thread.id = uuid.v4(); });

  return Thread;
}
