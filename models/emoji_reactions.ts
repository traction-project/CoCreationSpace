import Sequelize from "sequelize";
import uuid from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UsersAttributes } from "./users";
import { PostAttributes, PostInstance } from "./post";

export interface EmojiReactionsAttributes extends commonAttributes{
    emoji: string;
    second?: number;
    post_id: string;
    user_id: string;
    user?: UsersAttributes | UsersAttributes["id"];
    post?: PostAttributes | PostAttributes["id"];
}

/**
 * EmojiReactions instance object interface
 */
export interface EmojiReactionsInstance extends Sequelize.Model<EmojiReactionsAttributes>, EmojiReactionsAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;

  getPost: Sequelize.BelongsToGetAssociationMixin<PostInstance>;
  setPost: Sequelize.BelongsToSetAssociationMixin<PostInstance, PostInstance["id"]>;
}

/**
 * Build EmojiReactionss Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function EmojiReactionsModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<EmojiReactionsInstance> {
  // DB table name
  const TABLE_NAME = "emoji_reactions";
  // Model attributtes
  const attributes = {
    emoji : {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    second: {
      type: Sequelize.DataTypes.DECIMAL
    },
    post_id: {
      type: Sequelize.DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: Sequelize.DataTypes.UUIDV4,
      allowNull: false
    }
  };

  // Create the model
  const EmojiReactions = sequelize.define<EmojiReactionsInstance>("emoji_reactions", attributes, { underscored: true, tableName: TABLE_NAME });

  EmojiReactions.beforeCreate(emoji => { emoji.id = uuid.v4(); });

  return EmojiReactions;
}
