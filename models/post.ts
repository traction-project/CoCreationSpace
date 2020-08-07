import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { UsersAttributes, UserInstance } from "./users";
import { ThreadAttributes, ThreadInstance } from "./thread";
import { TagAttributes, TagInstance } from "./tag";

export interface PostAttributes extends commonAttributes{
    title: string;
    thread_id?: number;
    karma_points?: number;
    childPosts?: PostAttributes | PostAttributes["id"];
    parentPost?: PostAttributes | PostAttributes["id"];
    postReference?: PostAttributes | PostAttributes["id"];
    postReferenced?: PostAttributes | PostAttributes["id"];
    user?: UsersAttributes | UsersAttributes["id"];
    userReferenced?: UsersAttributes | UsersAttributes["id"];
    thread?: ThreadAttributes | ThreadAttributes["id"];
    tag?: TagAttributes | TagAttributes["id"];
}

/**
 * Post instance object interface
 */
export interface PostInstance extends Sequelize.Model<PostAttributes>, PostAttributes {
  getChildPosts: Sequelize.HasManyGetAssociationsMixin<PostInstance>;
  setChildPosts: Sequelize.HasManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addChildPosts: Sequelize.HasManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addChildPost: Sequelize.HasManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  hasChildPost: Sequelize.HasManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasChildPosts: Sequelize.HasManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countChildPosts: Sequelize.HasManyCountAssociationsMixin;

  getPostReference: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPostReference: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferences: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReference: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferences: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReference: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPostReferences: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPostReference: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPostReferences: Sequelize.BelongsToManyCountAssociationsMixin;

  getPostReferenced: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPostReferenced: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenceds: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenced: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenceds: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenced: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenceds: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenced: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPostReferenceds: Sequelize.BelongsToManyCountAssociationsMixin;

  getParentPost: Sequelize.BelongsToGetAssociationMixin<PostInstance>;
  setParentPost: Sequelize.BelongsToSetAssociationMixin<PostInstance, PostInstance["id"]>;

  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;

  getUserReferenced: Sequelize.BelongsToManyGetAssociationsMixin<UserInstance>;
  setUserReferenced: Sequelize.BelongsToManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addUserReferenceds: Sequelize.BelongsToManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  addUserReferenced: Sequelize.BelongsToManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  removeUserReferenceds: Sequelize.BelongsToManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>;
  removeUserReferenced: Sequelize.BelongsToManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>;
  hasUserReferenceds: Sequelize.BelongsToManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasUserReferenced: Sequelize.BelongsToManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  countUserReferenceds: Sequelize.BelongsToManyCountAssociationsMixin;

  getThread: Sequelize.BelongsToGetAssociationMixin<ThreadInstance>;
  setThread: Sequelize.BelongsToSetAssociationMixin<ThreadInstance, ThreadInstance["id"]>;

  getTag: Sequelize.BelongsToManyGetAssociationsMixin<TagInstance>;
  setTag: Sequelize.BelongsToManySetAssociationsMixin<TagInstance, TagInstance["id"]>;
  addTags: Sequelize.BelongsToManyAddAssociationsMixin<TagInstance, TagInstance["id"]>;
  addTag: Sequelize.BelongsToManyAddAssociationMixin<TagInstance, TagInstance["id"]>;
  createTags: Sequelize.BelongsToManyCreateAssociationMixin<TagInstance["id"]>;
  removeTag: Sequelize.BelongsToManyRemoveAssociationMixin<TagInstance, TagInstance["id"]>;
  removeTags: Sequelize.BelongsToManyRemoveAssociationsMixin<TagInstance, TagInstance["id"]>;
  hasTag: Sequelize.BelongsToManyHasAssociationMixin<TagInstance, TagInstance["id"]>;
  hasTags: Sequelize.BelongsToManyHasAssociationsMixin<TagInstance, TagInstance["id"]>;
  countTags: Sequelize.BelongsToManyCountAssociationsMixin;
}

/**
 *  Build Posts Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function PostModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PostInstance> {
  // Model attributtes
  const attributes = {
    title: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    karma_points: {
      type: Sequelize.DataTypes.INTEGER
    }
  };
  
  // Create the model
  const Post = sequelize.define<PostInstance>("post", attributes, { underscored: true, tableName: "posts" });

  return Post;
}
