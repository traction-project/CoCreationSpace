import * as Sequelize from "sequelize";
import * as uuid from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { PostAttributes, PostInstance } from "./post";

export interface TagAttributes extends commonAttributes{
    tag_name: string;
    post?: PostAttributes | PostAttributes["id"];
}

/**
 * Tag instance object interface
 */
export interface TagInstance extends Sequelize.Model<TagAttributes>, TagAttributes {
  getPost: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPost: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPosts: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPost: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  createPosts: Sequelize.BelongsToManyCreateAssociationMixin<PostInstance["id"]>;
  removePost: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePosts: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPost: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPosts: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPosts: Sequelize.BelongsToManyCountAssociationsMixin;
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
    tag_name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  };
  
  // Create the model
  const Tag = sequelize.define<TagInstance>("tag", attributes, { underscored: true, tableName: TABLE_NAME });

  Tag.beforeCreate(tag => { tag.id = uuid.v4(); });

  return Tag;
}
