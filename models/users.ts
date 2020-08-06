import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import * as Sequelize from "sequelize";

import { commonAttributes } from "typings/modelCommonAttributes";
import { getFromEnvironment } from "../util";
import { MultimediaInstance, MultimediaAttributes } from "./multimedia";
import { PreferencesAttributes, PreferencesInstance } from "./preferences";
import { PermissionsInstance, PermissionsAttributes } from "./permissions";
import { PostInstance, PostAttributes } from "./post";

const [SESSION_SECRET] = getFromEnvironment("SESSION_SECRET");

export interface UsersAttributes extends commonAttributes {
  username: string;
  password?: string;
  salt?: string;
  role?: string;
  multimedia?: MultimediaAttributes | MultimediaAttributes["id"];
  preferences?: PreferencesAttributes | PreferencesAttributes["id"];
  permissions?: PermissionsAttributes | PermissionsAttributes["id"];
  post?: PostAttributes | PostAttributes["id"];
  postReferenced?: PostAttributes | PostAttributes["id"];
}

type UserToken = {
  _id: string;
  username: string;
  token: string;
}

/**
 * Users instance object interface
 */
export interface UserInstance extends Sequelize.Model<UsersAttributes>, UsersAttributes {
  setPassword: (password: string) => void;
  validatePassword: (password: string) => boolean;
  generateToken: (validityInDays: number) => string;
  getAuth: () => UserToken;

  getMultimedia: Sequelize.HasManyGetAssociationsMixin<MultimediaInstance>;
  setMultimedia: Sequelize.HasManySetAssociationsMixin<MultimediaInstance, MultimediaInstance["id"]>;
  addMultimedias: Sequelize.HasManyAddAssociationsMixin<MultimediaInstance, MultimediaInstance["id"]>;
  addMultimedia: Sequelize.HasManyAddAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
  removeMultimedia: Sequelize.HasManyRemoveAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
  removeMultimedias: Sequelize.HasManyRemoveAssociationsMixin<MultimediaInstance, MultimediaInstance["id"]>;
  hasMultimedia: Sequelize.HasManyHasAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
  hasMultimedias: Sequelize.HasManyHasAssociationsMixin<MultimediaInstance, MultimediaInstance["id"]>;
  countMultimedias: Sequelize.HasManyCountAssociationsMixin;

  getPermissions: Sequelize.BelongsToGetAssociationMixin<PermissionsInstance>;
  setPermissions: Sequelize.BelongsToSetAssociationMixin<PermissionsInstance, PermissionsInstance["id"]>;

  getPreferences: Sequelize.BelongsToGetAssociationMixin<PreferencesInstance>;
  setPreferences: Sequelize.BelongsToSetAssociationMixin<PreferencesInstance, PreferencesInstance["id"]>;

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

  getPostReferenced: Sequelize.BelongsToManyGetAssociationsMixin<PostInstance>;
  setPostReferenced: Sequelize.BelongsToManySetAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenceds: Sequelize.BelongsToManyAddAssociationsMixin<PostInstance, PostInstance["id"]>;
  addPostReferenced: Sequelize.BelongsToManyAddAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenceds: Sequelize.BelongsToManyRemoveAssociationMixin<PostInstance, PostInstance["id"]>;
  removePostReferenced: Sequelize.BelongsToManyRemoveAssociationsMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenceds: Sequelize.BelongsToManyHasAssociationMixin<PostInstance, PostInstance["id"]>;
  hasPostReferenced: Sequelize.BelongsToManyHasAssociationsMixin<PostInstance, PostInstance["id"]>;
  countPostReferenceds: Sequelize.BelongsToManyCountAssociationsMixin;
}

/**
 *  Build Users Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function UsersModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserInstance> {
  // Model attributtes
  const attributes = {
    username: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: Sequelize.DataTypes.STRING,
      unique: true
    },
    salt: {
      type: Sequelize.DataTypes.STRING
    },
    role: {
      type: Sequelize.DataTypes.STRING
    },
    preferences_id: {
      type: Sequelize.DataTypes.INTEGER
    }
  };

  // Create the model
  const Users = sequelize.define<UserInstance>("users", attributes, { underscored: true, tableName: "users" });

  Users.prototype.setPassword = function (password: string): void {
    this.salt = crypto.randomBytes(16).toString("hex");
    this.password = crypto.pbkdf2Sync(
      password, this.salt,
      10000, 512,
      "sha512"
    ).toString("hex");
  };

  Users.prototype.validatePassword = function (password: string): boolean {
    const hashedPassword = crypto.pbkdf2Sync(
      password, this.salt,
      10000, 512,
      "sha512"
    ).toString("hex");

    return this.password == hashedPassword;
  };

  Users.prototype.generateToken = function (validityInDays = 60): string {
    // Generate timestamp n days from now
    const now = new Date();
    const expirationDate = new Date().setDate(now.getDate() + validityInDays);

    return jwt.sign({
      id: this.id,
      username: this.username,
      exp: Math.floor(expirationDate / 1000)
    }, SESSION_SECRET);
  };

  Users.prototype.getAuth = function (): UserToken {
    return {
      _id: `${this.id}`,
      username: this.username,
      token: this.generateToken()
    };
  };

  return Users;
}
