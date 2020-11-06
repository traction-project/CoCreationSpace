import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { TopicAttributes, TopicInstance } from "./topic";
import { PostAttributes, PostInstance } from "./post";

export interface ThreadAttributes extends commonAttributes{
    th_title: string;
    topic?: TopicAttributes | TopicAttributes["id"];
    post?: PostAttributes | PostAttributes["id"];
}

type ThreadCreationAttributes = Optional<ThreadAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Thread instance object interface
 */
export interface ThreadInstance extends Sequelize.Model<ThreadAttributes, ThreadCreationAttributes>, ThreadAttributes {
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
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    th_title: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    }
  };

  // Create the model
  const Thread = sequelize.define<ThreadInstance, ThreadCreationAttributes>("thread", attributes, { underscored: true, tableName: TABLE_NAME });

  Thread.beforeCreate(thread => { thread.id = uuidv4(); });

  return Thread;
}
