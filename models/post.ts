import Sequelize from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { UsersAttributes, UserInstance } from "./users";
import { ThreadAttributes, ThreadInstance } from "./thread";
import { TagAttributes, TagInstance } from "./tag";
import { DataContainerAttributes, DataContainerInstance } from "./data_container";
import { EmojiReactionsAttributes, EmojiReactionsInstance } from "./emoji_reactions";

export interface PostAttributes extends commonAttributes{
    title?: string;
    second?: number;
    parent_post_id?: string;
    user_id?: string;
    thread_id?: string;
    karma_points?: number;
    dataContainer?: DataContainerAttributes | DataContainerAttributes["id"];
    emojiReactions?: EmojiReactionsAttributes | EmojiReactionsAttributes["id"];
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

/**
 * Post instance object interface
 */
export interface PostInstance extends Sequelize.Model<PostAttributes>, PostAttributes {
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

  getEmojiReactions: Sequelize.HasManyGetAssociationsMixin<EmojiReactionsInstance>;
  setEmojiReactions: Sequelize.HasManySetAssociationsMixin<EmojiReactionsInstance, EmojiReactionsInstance["id"]>;
  addEmojiReactions: Sequelize.HasManyAddAssociationsMixin<EmojiReactionsInstance, EmojiReactionsInstance["id"]>;
  addEmojiReaction: Sequelize.HasManyAddAssociationMixin<EmojiReactionsInstance, EmojiReactionsInstance["id"]>;
  removeEmojiReaction: Sequelize.HasManyRemoveAssociationMixin<EmojiReactionsInstance, EmojiReactionsInstance["id"]>;
  removeEmojiReactions: Sequelize.HasManyRemoveAssociationsMixin<EmojiReactionsInstance, EmojiReactionsInstance["id"]>;
  hasEmojiReaction: Sequelize.HasManyHasAssociationMixin<EmojiReactionsInstance, EmojiReactionsInstance["id"]>;
  hasEmojiReactions: Sequelize.HasManyHasAssociationsMixin<EmojiReactionsInstance, EmojiReactionsInstance["id"]>;
  countEmojiReactions: Sequelize.HasManyCountAssociationsMixin;
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
    title: {
      type: Sequelize.DataTypes.STRING
    },
    second: {
      type: Sequelize.DataTypes.DECIMAL
    },
    karma_points: {
      type: Sequelize.DataTypes.INTEGER
    }
  };

  // Create the model
  const Post = sequelize.define<PostInstance>("post", attributes, { underscored: true, tableName: TABLE_NAME });

  Post.beforeCreate(post => { post.id = uuidv4(); });

  return Post;
}
