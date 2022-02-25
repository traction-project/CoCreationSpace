import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserAttributes, UserInstance } from "./user";
import { ThreadAttributes, ThreadInstance } from "./thread";
import { TagAttributes, TagInstance } from "./tag";
import { DataContainerAttributes, DataContainerInstance } from "./data_container";
import { UserGroupInstance } from "./user_group";
import { db } from "./index";

export interface PostAttributes extends CommonAttributes{
  title?: string;
  second?: number;
  parentPostId?: string;
  userId?: string;
  threadId?: string;
  multimediaRef?: string;
  karmaPoints?: number;
  dataContainer?: DataContainerAttributes;
  comments?: PostAttributes | PostAttributes["id"];
  likedUsers?: UserAttributes | UserAttributes["id"];
  parentPost?: PostAttributes | PostAttributes["id"];
  postReference?: PostAttributes | PostAttributes["id"];
  postReferenced?: PostAttributes | PostAttributes["id"];
  user?: UserAttributes | UserAttributes["id"];
  userReferenced?: UserAttributes | UserAttributes["id"];
  thread?: ThreadAttributes | ThreadAttributes["id"];
  tags?: TagAttributes | TagAttributes["id"];
  published?: boolean;
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

  getLikedUsers: Sequelize.BelongsToManyGetAssociationsMixin<UserInstance>;
  countLikedUsers: Sequelize.BelongsToManyCountAssociationsMixin;
  hasLikedUser: Sequelize.BelongsToManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasLikedUsers: Sequelize.BelongsToManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  setLikedUsers: Sequelize.BelongsToManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addLikedUser: Sequelize.BelongsToManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  addLikedUsers: Sequelize.BelongsToManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  removeLikedUser: Sequelize.BelongsToManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>;
  removeLikedUsers: Sequelize.BelongsToManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>;
  createLikedUser: Sequelize.BelongsToManyCreateAssociationMixin<UserInstance>;

  getPostReference: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPostReferences: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferences: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReference: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReference: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferences: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPostReference: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPostReferences: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPostReferences: Sequelize.BelongsToManyCountAssociationsMixin;

  getPostReferenced: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPostReferenced: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenceds: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenced: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenceds: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenced: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenced: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenceds: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPostReferenceds: Sequelize.BelongsToManyCountAssociationsMixin;

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
  countTags: Sequelize.BelongsToManyCountAssociationsMixin;
  hasTag: Sequelize.BelongsToManyHasAssociationMixin<TagInstance, TagInstance["id"]>;
  hasTags: Sequelize.BelongsToManyHasAssociationsMixin<TagInstance, TagInstance["id"]>;
  setTags: Sequelize.BelongsToManySetAssociationsMixin<TagInstance, TagInstance["id"]>;
  addTag: Sequelize.BelongsToManyAddAssociationMixin<TagInstance, TagInstance["id"]>;
  addTags: Sequelize.BelongsToManyAddAssociationsMixin<TagInstance, TagInstance["id"]>;
  removeTag: Sequelize.BelongsToManyRemoveAssociationMixin<TagInstance, TagInstance["id"]>;
  removeTags: Sequelize.BelongsToManyRemoveAssociationsMixin<TagInstance, TagInstance["id"]>;
  createTags: Sequelize.BelongsToManyCreateAssociationMixin<TagInstance["id"]>;

  getFavourites: Sequelize.HasManyGetAssociationsMixin<UserInstance>;
  setFavourites: Sequelize.HasManySetAssociationsMixin<UserInstance, UserInstance["id"]>;
  addFavourites: Sequelize.HasManyAddAssociationsMixin<UserInstance, UserInstance["id"]>;
  addFavourite: Sequelize.HasManyAddAssociationMixin<UserInstance, UserInstance["id"]>;
  removeFavourite: Sequelize.HasManyRemoveAssociationMixin<UserInstance, UserInstance["id"]>;
  removeFavourites: Sequelize.HasManyRemoveAssociationsMixin<UserInstance, UserInstance["id"]>;
  hasFavourite: Sequelize.HasManyHasAssociationMixin<UserInstance, UserInstance["id"]>;
  hasFavourites: Sequelize.HasManyHasAssociationsMixin<UserInstance, UserInstance["id"]>;
  countFavourites: Sequelize.HasManyCountAssociationsMixin;

  destroyWithComments: () => Promise<void>;
  destroyWithCommentsAndThread: () => Promise<void>;
  getParentPost: () => Promise<PostInstance | null>;
  getUserGroup: () => Promise<UserGroupInstance | null>;
  countAllComments: () => Promise<number>;
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
    karmaPoints: {
      type: Sequelize.DataTypes.INTEGER
    },
    multimediaRef: {
      type: Sequelize.DataTypes.UUID
    },
    published: {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: true
    }
  };

  // Create the model
  const Post = sequelize.define<PostInstance, PostCreationAttributes>("post", attributes, { underscored: true, tableName: TABLE_NAME });

  Post.beforeCreate(post => { post.id = uuidv4(); });

  /**
   * Deletes the current post instance and all its children recursively.
   */
  Post.prototype.destroyWithComments = async function (this: PostInstance) {
    const comments = await this.getComments();

    await Promise.all(comments.map((postComment: PostInstance) => {
      return postComment.destroyWithComments();
    }));

    await this.destroy();
  };

  /**
   * Deletes the current post instance and all its children recursively. Also
   * destroys the associated thread if it becomes empty as a result of this
   * operation.
   */
  Post.prototype.destroyWithCommentsAndThread = async function (this: PostInstance) {
    const thread = await this.getThread();
    await this.destroyWithComments();

    if (await thread.countPosts() == 0) {
      await thread.destroy();
    }
  };

  /**
   * Returns the parent post of the current post, or null if it is a top-level
   * post.
   */
  Post.prototype.getParentPost = async function (this: PostInstance) {
    return Post.findByPk(this.parentPostId);
  };

  /**
   * Returns the user group that a post was posted in or null if associations
   * could not be queried.
   */
  Post.prototype.getUserGroup = async function (this: PostInstance): Promise<UserGroupInstance | null> {
    const { Topic, UserGroup } = db.getModels();

    const thread = await (this as PostInstance).getThread({
      include: [{
        model: Topic,
        include: [
          UserGroup
        ]
      }]
    });

    if (!thread.topic) {
      return null;
    }

    return (thread.topic as any).userGroup;
  };

  /**
   * Counts all comments of the given post recursively and returns the count.
   */
  Post.prototype.countAllComments = async function (this: PostInstance): Promise<number> {
    const comments = await this.getComments({ attributes: ["id"] });
    let childCommentLength = comments.length;

    for (const comment of comments) {
      childCommentLength += await comment.countAllComments();
    }

    return childCommentLength;
  };

  return Post;
}
