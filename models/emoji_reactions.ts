import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UsersAttributes } from "./users";
import { PostAttributes, PostInstance } from "./post";

export interface EmojiReactionsAttributes extends CommonAttributes{
    emoji: string;
    second?: number;
    multimedia_id: string;
    user_id: string;
    user?: UsersAttributes | UsersAttributes["id"];
    post?: PostAttributes | PostAttributes["id"];
}

type EmojiReactionsCreationAttributes = Optional<EmojiReactionsAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * EmojiReactions instance object interface
 */
export interface EmojiReactionsInstance extends Sequelize.Model<EmojiReactionsAttributes, EmojiReactionsCreationAttributes>, EmojiReactionsAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;

  getMultimedia: Sequelize.BelongsToGetAssociationMixin<PostInstance>;
  setMultimedia: Sequelize.BelongsToSetAssociationMixin<PostInstance, PostInstance["id"]>;
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
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    emoji : {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    second: {
      type: Sequelize.DataTypes.DOUBLE
    },
    multimedia_id: {
      type: Sequelize.DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: Sequelize.DataTypes.UUIDV4,
      allowNull: false
    }
  };

  // Create the model
  const EmojiReactions = sequelize.define<EmojiReactionsInstance, EmojiReactionsCreationAttributes>("emoji_reactions", attributes, { underscored: true, tableName: TABLE_NAME });

  EmojiReactions.beforeCreate(emoji => { emoji.id = uuidv4(); });

  return EmojiReactions;
}
