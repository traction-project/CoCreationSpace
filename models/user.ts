import crypto from "crypto";
import jwt from "jsonwebtoken";
import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { getFromEnvironment } from "../util";
import { MediaItemInstance, MediaItemAttributes } from "./media_item";
import { PermissionInstance, PermissionAttributes } from "./permission";
import { PostInstance, PostAttributes } from "./post";
import { EmojiReactionInstance } from "./emoji_reaction";
import { TopicInstance } from "./topic";
import { NotificationAttributes, NotificationInstance } from "./notification";
import { UserGroupInstance } from "./user_group";
import { MultimediaInteractionInstance } from "./multimedia_interaction";
import { InternalNavigationStepInstance } from "./internal_navigation_step";
import { ConsentFormInstance } from "./consent_form";
import { SearchQueryInstance } from "./search_query";
import { db } from "./index";

const [ SESSION_SECRET ] = getFromEnvironment("SESSION_SECRET");

export interface UserAttributes extends CommonAttributes {
  username: string;
  email?: string;
  password?: string;
  image?: string;
  salt?: string;
  role?: string;
  preferredLanguage?: string;
  likedPosts?: PostAttributes | PostAttributes["id"];
  mediaItem?: MediaItemAttributes | MediaItemAttributes["id"];
  permission?: PermissionAttributes | PermissionAttributes["id"];
  post?: PostAttributes | PostAttributes["id"];
  notification?: NotificationAttributes | NotificationAttributes["id"];
  postReferenced?: PostAttributes | PostAttributes["id"];
  emojiReactions?: EmojiReactionInstance | EmojiReactionInstance["id"];
  resettoken?: string | null;
  resetAt?: Date;
  participantCode?: string;
}

type UserCreationAttributes = Optional<UserAttributes, "id" | "createdAt" | "updatedAt">;

interface UserToken {
  _id: string;
  username: string;
  token: string;
}

/**
 * Users instance object interface
 */
export interface UserInstance extends Sequelize.Model<UserAttributes, UserCreationAttributes>, UserAttributes {
  setPassword: (password: string) => void;
  validatePassword: (password: string) => boolean;
  generateToken: (validityInDays: number) => string;
  getAuth: () => UserToken;
  isAdmin: () => Promise<boolean>;
  getApprovedPermissions: () => Promise<PermissionInstance[]>;
  hasApprovedPermission: (type: string) => Promise<boolean>;

  getLikedPosts: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  countLikedPosts: Sequelize.BelongsToManyCountAssociationsMixin;
  hasLikedPost: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasLikedPosts: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  setLikedPosts: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addLikedPost: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  addLikedPosts: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  removeLikedPost: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removeLikedPosts: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  createLikedPost: Sequelize.BelongsToManyCreateAssociationMixin<PostInstance>;

  getMediaItems: Sequelize.HasManyGetAssociationsMixin<MediaItemInstance>;
  countMediaItems: Sequelize.HasManyCountAssociationsMixin;
  hasMediaItem: Sequelize.HasManyHasAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
  hasMediaItems: Sequelize.HasManyHasAssociationsMixin<MediaItemInstance, MediaItemInstance["id"]>;
  setMediaItems: Sequelize.HasManySetAssociationsMixin<MediaItemInstance, MediaItemInstance["id"]>;
  addMediaItem: Sequelize.HasManyAddAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
  addMediaItems: Sequelize.HasManyAddAssociationsMixin<MediaItemInstance, MediaItemInstance["id"]>;
  removeMediaItem: Sequelize.HasManyRemoveAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
  removeMediaItems: Sequelize.HasManyRemoveAssociationsMixin<MediaItemInstance, MediaItemInstance["id"]>;
  createMediaItem: Sequelize.HasManyCreateAssociationMixin<MediaItemInstance>;

  getPermissions: Sequelize.BelongsToManyGetAssociationsMixin<PermissionInstance>;
  countPermissions: Sequelize.BelongsToManyCountAssociationsMixin;
  hasPermission: Sequelize.BelongsToManyHasAssociationMixin<PermissionInstance, PermissionInstance["id"]>;
  hasPermissions: Sequelize.BelongsToManyHasAssociationsMixin<PermissionInstance, PermissionInstance["id"]>;
  setPermissions: Sequelize.BelongsToManySetAssociationsMixin<PermissionInstance, PermissionInstance["id"]>;
  addPermission: Sequelize.BelongsToManyAddAssociationMixin<PermissionInstance, PermissionInstance["id"]>
  addPermissions: Sequelize.BelongsToManyAddAssociationsMixin<PermissionInstance, PermissionInstance["id"]>
  removePermission: Sequelize.BelongsToManyRemoveAssociationMixin<PermissionInstance, PermissionInstance["id"]>
  removePermissions: Sequelize.BelongsToManyRemoveAssociationsMixin<PermissionInstance, PermissionInstance["id"]>
  createPermission: Sequelize.BelongsToManyCreateAssociationMixin<PermissionInstance>

  getPosts: Sequelize.HasManyGetAssociationsMixin<PostInstance>;
  countPosts: Sequelize.HasManyCountAssociationsMixin;
  hasPost: Sequelize.HasManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPosts: Sequelize.HasManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  setPosts: Sequelize.HasManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPost: Sequelize.HasManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  addPosts: Sequelize.HasManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  removePost: Sequelize.HasManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePosts: Sequelize.HasManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  createPost: Sequelize.HasManyCreateAssociationMixin<PostInstance>;

  getPostReferenced: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPostReferenced: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenceds: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenced: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenceds: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenced: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenceds: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenced: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPostReferenceds: Sequelize.BelongsToManyCountAssociationsMixin;

  getEmojiReactions: Sequelize.HasManyGetAssociationsMixin<EmojiReactionInstance>;
  setEmojiReactions: Sequelize.HasManySetAssociationsMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  addEmojiReactions: Sequelize.HasManyAddAssociationsMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  addEmojiReaction: Sequelize.HasManyAddAssociationMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  removeEmojiReaction: Sequelize.HasManyRemoveAssociationMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  removeEmojiReactions: Sequelize.HasManyRemoveAssociationsMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  hasEmojiReaction: Sequelize.HasManyHasAssociationMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  hasEmojiReactions: Sequelize.HasManyHasAssociationsMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  countEmojiReactions: Sequelize.HasManyCountAssociationsMixin;

  getInterestedTopics: Sequelize.BelongsToManyGetAssociationsMixin<TopicInstance>;
  countInterestedTopics: Sequelize.BelongsToManyCountAssociationsMixin;
  hasInterestedTopic: Sequelize.BelongsToManyHasAssociationMixin<TopicInstance, TopicInstance["id"]>;
  hasInterestedTopics: Sequelize.BelongsToManyHasAssociationsMixin<TopicInstance, TopicInstance["id"]>;
  setInterestedTopics: Sequelize.BelongsToManySetAssociationsMixin<TopicInstance, TopicInstance["id"]>;
  addInterestedTopic: Sequelize.BelongsToManyAddAssociationMixin<TopicInstance, TopicInstance["id"]>;
  addInterestedTopics: Sequelize.BelongsToManyAddAssociationsMixin<TopicInstance, TopicInstance["id"]>;
  removeInterestedTopic: Sequelize.BelongsToManyRemoveAssociationMixin<TopicInstance, TopicInstance["id"]>;
  removeInterestedTopics: Sequelize.BelongsToManyRemoveAssociationsMixin<TopicInstance, TopicInstance["id"]>;
  createInterestedTopic: Sequelize.BelongsToManyCreateAssociationMixin<TopicInstance>;

  getUserGroups: Sequelize.BelongsToManyGetAssociationsMixin<UserGroupInstance>;
  countUserGroups: Sequelize.BelongsToManyCountAssociationsMixin;
  hasUserGroup: Sequelize.BelongsToManyHasAssociationMixin<UserGroupInstance, UserGroupInstance["id"]>;
  hasUserGroups: Sequelize.BelongsToManyHasAssociationsMixin<UserGroupInstance, UserGroupInstance["id"]>;
  setUserGroups: Sequelize.BelongsToManySetAssociationsMixin<UserGroupInstance, UserGroupInstance["id"]>;
  addUserGroup: Sequelize.BelongsToManyAddAssociationMixin<UserGroupInstance, UserGroupInstance["id"]>;
  addUserGroups: Sequelize.BelongsToManyAddAssociationsMixin<UserGroupInstance, UserGroupInstance["id"]>;
  removeUserGroup: Sequelize.BelongsToManyRemoveAssociationMixin<UserGroupInstance, UserGroupInstance["id"]>;
  removeUserGroups: Sequelize.BelongsToManyRemoveAssociationsMixin<UserGroupInstance, UserGroupInstance["id"]>;
  createUserGroup: Sequelize.BelongsToManyCreateAssociationMixin<UserGroupInstance>;

  getNotifications: Sequelize.BelongsToManyGetAssociationsMixin<NotificationInstance>;
  setNotifications: Sequelize.BelongsToManySetAssociationsMixin<NotificationInstance, NotificationInstance["id"]>;
  addNotifications: Sequelize.BelongsToManyAddAssociationsMixin<NotificationInstance, NotificationInstance["id"]>;
  addNotification: Sequelize.BelongsToManyAddAssociationMixin<NotificationInstance, NotificationInstance["id"]>;
  removeNotification: Sequelize.BelongsToManyRemoveAssociationMixin<NotificationInstance, NotificationInstance["id"]>;
  removeNotifications: Sequelize.BelongsToManyRemoveAssociationsMixin<NotificationInstance, NotificationInstance["id"]>;
  hasNotification: Sequelize.BelongsToManyHasAssociationMixin<NotificationInstance, NotificationInstance["id"]>;
  hasNotifications: Sequelize.BelongsToManyHasAssociationsMixin<NotificationInstance, NotificationInstance["id"]>;
  countNotifications: Sequelize.BelongsToManyCountAssociationsMixin;

  getMultimediaInteractions: Sequelize.HasManyGetAssociationsMixin<MultimediaInteractionInstance>;
  setMultimediaInteractions: Sequelize.HasManySetAssociationsMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  addMultimediaInteractions: Sequelize.HasManyAddAssociationsMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  addMultimediaInteraction: Sequelize.HasManyAddAssociationMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  removeMultimediaInteraction: Sequelize.HasManyRemoveAssociationMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  removeMultimediaInteractions: Sequelize.HasManyRemoveAssociationsMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  hasMultimediaInteraction: Sequelize.HasManyHasAssociationMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  hasMultimediaInteractions: Sequelize.HasManyHasAssociationsMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  countMultimediaInteractions: Sequelize.HasManyCountAssociationsMixin;

  getInternalNavigationSteps: Sequelize.HasManyGetAssociationsMixin<InternalNavigationStepInstance>;
  setInternalNavigationSteps: Sequelize.HasManySetAssociationsMixin<InternalNavigationStepInstance, InternalNavigationStepInstance["id"]>;
  addInternalNavigationSteps: Sequelize.HasManyAddAssociationsMixin<InternalNavigationStepInstance, InternalNavigationStepInstance["id"]>;
  addInternalNavigationStep: Sequelize.HasManyAddAssociationMixin<InternalNavigationStepInstance, InternalNavigationStepInstance["id"]>;
  removeInternalNavigationStep: Sequelize.HasManyRemoveAssociationMixin<InternalNavigationStepInstance, InternalNavigationStepInstance["id"]>;
  removeInternalNavigationSteps: Sequelize.HasManyRemoveAssociationsMixin<InternalNavigationStepInstance, InternalNavigationStepInstance["id"]>;
  hasInternalNavigationStep: Sequelize.HasManyHasAssociationMixin<InternalNavigationStepInstance, InternalNavigationStepInstance["id"]>;
  hasInternalNavigationSteps: Sequelize.HasManyHasAssociationsMixin<InternalNavigationStepInstance, InternalNavigationStepInstance["id"]>;
  countInternalNavigationSteps: Sequelize.HasManyCountAssociationsMixin;

  getConsentForms: Sequelize.HasManyGetAssociationsMixin<ConsentFormInstance>;
  setConsentForms: Sequelize.HasManySetAssociationsMixin<ConsentFormInstance, InternalNavigationStepInstance["id"]>;
  addConsentForms: Sequelize.HasManyAddAssociationsMixin<ConsentFormInstance, InternalNavigationStepInstance["id"]>;
  addConsentForm: Sequelize.HasManyAddAssociationMixin<ConsentFormInstance, InternalNavigationStepInstance["id"]>;
  removeConsentForm: Sequelize.HasManyRemoveAssociationMixin<ConsentFormInstance, InternalNavigationStepInstance["id"]>;
  removeConsentForms: Sequelize.HasManyRemoveAssociationsMixin<ConsentFormInstance, InternalNavigationStepInstance["id"]>;
  hasConsentForm: Sequelize.HasManyHasAssociationMixin<ConsentFormInstance, InternalNavigationStepInstance["id"]>;
  hasConsentForms: Sequelize.HasManyHasAssociationsMixin<ConsentFormInstance, InternalNavigationStepInstance["id"]>;
  countConsentForms: Sequelize.HasManyCountAssociationsMixin;

  getSearchQueries: Sequelize.HasManyGetAssociationsMixin<SearchQueryInstance>;
  setSearchQueries: Sequelize.HasManySetAssociationsMixin<SearchQueryInstance, SearchQueryInstance["id"]>;
  addSearchQueries: Sequelize.HasManyAddAssociationsMixin<SearchQueryInstance, SearchQueryInstance["id"]>;
  addSearchQuery: Sequelize.HasManyAddAssociationMixin<SearchQueryInstance, SearchQueryInstance["id"]>;
  removeSearchQuery: Sequelize.HasManyRemoveAssociationMixin<SearchQueryInstance, SearchQueryInstance["id"]>;
  removeSearchQueries: Sequelize.HasManyRemoveAssociationsMixin<SearchQueryInstance, SearchQueryInstance["id"]>;
  hasSearchQuery: Sequelize.HasManyHasAssociationMixin<SearchQueryInstance, SearchQueryInstance["id"]>;
  hasSearchQueries: Sequelize.HasManyHasAssociationsMixin<SearchQueryInstance, SearchQueryInstance["id"]>;
  countSearchQueries: Sequelize.HasManyCountAssociationsMixin;
}

/**
 *  Build User Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function UserModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserInstance> {

  const keyPasswordLeng = 512;
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    image: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: "717502c4-23d9-4ab7-bee9-171a92fb3842.png"
    },
    username: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: Sequelize.DataTypes.STRING,
      unique: true
    },
    password: {
      type: Sequelize.DataTypes.STRING(keyPasswordLeng * 2),
      unique: true
    },
    salt: {
      type: Sequelize.DataTypes.STRING
    },
    role: {
      type: Sequelize.DataTypes.STRING
    },
    preferredLanguage: {
      type: Sequelize.DataTypes.STRING
    },
    resettoken: {
      type: Sequelize.DataTypes.STRING
    },
    resetAt: {
      type: Sequelize.DataTypes.DATE
    },
    participantCode: {
      type: Sequelize.DataTypes.STRING
    }
  };

  // Create the model
  const User = sequelize.define<UserInstance, UserCreationAttributes>("user", attributes, { underscored: true, tableName: "users" });

  User.beforeCreate(user => { user.id = uuidv4(); });

  User.prototype.setPassword = function (this: UserInstance, password: string): void {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.password = crypto.pbkdf2Sync(
      password, this.salt,
      10000, keyPasswordLeng,
      "sha512"
    ).toString("hex");
  };

  User.prototype.validatePassword = function (this: UserInstance, password: string): boolean {
    const hashedPassword = crypto.pbkdf2Sync(
      password, this.salt!,
      10000, keyPasswordLeng,
      "sha512"
    ).toString("hex");

    return this.password == hashedPassword;
  };

  User.prototype.generateToken = function (this: UserInstance, validityInDays = 60): string {
    // Generate timestamp n days from now
    const now = new Date();
    const expirationDate = new Date().setDate(now.getDate() + validityInDays);

    return jwt.sign({
      id: this.id,
      username: this.username,
      exp: Math.floor(expirationDate / 1000)
    }, SESSION_SECRET);
  };

  User.prototype.getAuth = function (): UserToken {
    return {
      _id: `${this.id}`,
      username: this.username,
      token: this.generateToken()
    };
  };

  /**
   * Checks if the current user has a permission of type 'admin'
   */
  User.prototype.isAdmin = async function (this: UserInstance): Promise<boolean> {
    if (this.role == "admin") {
      return true;
    }

    const { Permission } = db.getModels();
    const adminPermission = await Permission.findOne({ where: { type: "admin" }});

    if (adminPermission) {
      return await this.hasPermission(adminPermission);
    }

    return false;
  };

  /**
   * Retrieves a list of approved permissions for the current user
   */
  User.prototype.getApprovedPermissions = async function (this: UserInstance): Promise<PermissionInstance[]> {
    const { Permission } = db.getModels();

    const approvedPermissions = Permission.findAll({
      include: {
        model: User,
        required: true,
        through: { where: { approved: true }},
        attributes: []
      }
    });

    return approvedPermissions;
  };

  /**
   * Checks whether the current user has a certain permission and that
   * permission has been approved
   */
  User.prototype.hasApprovedPermission = async function (this: UserInstance, type: string): Promise<boolean> {
    const { Permission } = db.getModels();

    const permissions = await Permission.findOne({
      where: {
        type
      },
      include: {
        model: User,
        required: true,
        through: { where: { approved: true }},
        attributes: []
      }
    });

    return permissions != null;
  };

  return User;
}
