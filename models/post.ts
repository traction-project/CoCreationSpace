import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UsersAttributes, UserInstance } from "./users";
import { ThreadAttributes, ThreadInstance } from "./thread";
import { TagAttributes, TagInstance } from "./tag";
import { DataContainerAttributes, DataContainerInstance } from "./data_container";

export interface PostAttributes extends CommonAttributes{
  title?: string;
  second?: number;
  parent_post_id?: string;
  user_id?: string;
  thread_id?: string;
  multimedia_ref?: string;
  karma_points?: number;
  dataContainer?: DataContainerAttributes | DataContainerAttributes["id"];
  comments?: PostAttributes | PostAttributes["id"];
  likesUsers?: UsersAttributes | UsersAttributes["id"];
  parentPost?: PostAttributes | PostAttributes["id"];
  postReference?: PostAttributes | PostAttributes["id"];
  postReferenced?: PostAttributes | PostAttributes["id"];
  user?: UsersAttributes | UsersAttributes["id"];
  userReferenced?: UsersAttributes | UsersAttributes["id"];
  thread?: ThreadAttributes | ThreadAttributes["id"];
  tags?: TagAttributes | TagAttributes["id"];
}

type PostCreationAttributes = Optional<PostAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Post instance object interface
 */
export interface PostInstance extends Sequelize.Model<PostAttributes, PostCreationAttributes>, PostAttributes {
  getDataContainer: Sequelize.HasOneGetAssociationMixin<DataContainerInstance>;
  setDataContainer: Sequelize.HasOneSetAssociationMixin<DataContainerInstance, DataContainerInstance["id"]>;
  createDataContainer: Sequelize.HasOneCreateAssociationMixin<DataContainerInstance>;

  getComments: Sequelize.HasManyGetAssociationsMixin<PostInstance>;
  setComments: Sequelize.HasManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addComments: Sequelize.HasManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addComment: Sequelize.HasManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  hasComment: Sequelize.HasManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasComments: Sequelize.HasManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countComments: Sequelize.HasManyCountAssociationsMixin;

  getLikesUsers: Sequelize.BelongsToManyGetAssociationsMixin<UserInstance>;
  setLikesUsers: Sequelize.BelongsToManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addLikesUsers: Sequelize.BelongsToManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  addLikesUser: Sequelize.BelongsToManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  removeLikesUser: Sequelize.BelongsToManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>;
  removeLikesUsers: Sequelize.BelongsToManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>;
  hasLikesUser: Sequelize.BelongsToManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasLikesUsers: Sequelize.BelongsToManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  countLikesUsers: Sequelize.BelongsToManyCountAssociationsMixin;

  getPostReference: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPostReference: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferences: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReference: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReference: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferences: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPostReference: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPostReferences: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPostReference: Sequelize.BelongsToManyCountAssociationsMixin;

  getPostReferenced: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPostReferenced: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenceds: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenced: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenceds: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenced: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenced: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenceds: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
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

  getTags: Sequelize.BelongsToManyGetAssociationsMixin<TagInstance>;
  setTags: Sequelize.BelongsToManySetAssociationsMixin<TagInstance, TagInstance["id"]>;
  addTags: Sequelize.BelongsToManyAddAssociationsMixin<TagInstance, TagInstance["id"]>;
  addTag: Sequelize.BelongsToManyAddAssociationMixin<TagInstance, TagInstance["id"]>;
  createTags: Sequelize.BelongsToManyCreateAssociationMixin<TagInstance["id"]>;
  removeTag: Sequelize.BelongsToManyRemoveAssociationMixin<TagInstance, TagInstance["id"]>;
  removeTags: Sequelize.BelongsToManyRemoveAssociationsMixin<TagInstance, TagInstance["id"]>;
  hasTag: Sequelize.BelongsToManyHasAssociationMixin<TagInstance, TagInstance["id"]>;
  hasTags: Sequelize.BelongsToManyHasAssociationsMixin<TagInstance, TagInstance["id"]>;
  countTags: Sequelize.BelongsToManyCountAssociationsMixin;

  destroyWithComments: () => Promise<void>;
}

/**
 *  Build Posts Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function PostModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PostInstance> {
  //  DB table name
  const TABLE_NAME = "posts";
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
      type: Sequelize.DataTypes.STRING
    },
    second: {
      type: Sequelize.DataTypes.DECIMAL
    },
    karma_points: {
      type: Sequelize.DataTypes.INTEGER
    },
    multimedia_ref: {
      type: Sequelize.DataTypes.UUID
    }
  };

  // Create the model
  const Post = sequelize.define<PostInstance, PostCreationAttributes>("post", attributes, { underscored: true, tableName: TABLE_NAME });

  Post.beforeCreate(post => { post.id = uuidv4(); });

  /**
   * Deletes the current post instance and all its children recursively.
   */
  Post.prototype.destroyWithComments = async function () {
    const comments = await this.getComments();

    await Promise.all(comments.map((postComment: PostInstance) => {
      return postComment.destroyWithComments();
    }));

    await this.destroy();
  };

  return Post;
}
