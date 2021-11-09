import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { PostAttributes, PostInstance } from "./post";

export interface TagAttributes extends CommonAttributes{
  tagName: string;
  post?: PostAttributes | PostAttributes["id"];
}

type TagCreationAttributes = Optional<TagAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Tag instance object interface
 */
export interface TagInstance extends Sequelize.Model<TagAttributes, TagCreationAttributes>, TagAttributes {
  getPosts: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  countPosts: Sequelize.BelongsToManyCountAssociationsMixin;
  hasPost: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPosts: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  setPosts: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPost: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  addPosts: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  removePost: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePosts: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  createPost: Sequelize.BelongsToManyCreateAssociationMixin<PostInstance["id"]>;
}

/**
 *  Build Tags Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function TagModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<TagInstance> {
  //  DB table name
  const TABLE_NAME = "tags";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    tagName: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  };

  // Create the model
  const Tag = sequelize.define<TagInstance, TagCreationAttributes>("tag", attributes, { underscored: true, tableName: TABLE_NAME });

  Tag.beforeCreate(tag => { tag.id = uuidv4(); });

  return Tag;
}
