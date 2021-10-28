import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UserAttributes } from "./user";
import { PostAttributes, PostInstance } from "./post";

export interface EmojiReactionAttributes extends CommonAttributes{
    emoji: string;
    second?: number;
    media_item_id: string;
    user_id: string;
    user?: UserAttributes | UserAttributes["id"];
    post?: PostAttributes | PostAttributes["id"];
}

type EmojiReactionCreationAttributes = Optional<EmojiReactionAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * EmojiReactions instance object interface
 */
export interface EmojiReactionInstance extends Sequelize.Model<EmojiReactionAttributes, EmojiReactionCreationAttributes>, EmojiReactionAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;

  getMediaItem: Sequelize.BelongsToGetAssociationMixin<PostInstance>;
  setMediaItem: Sequelize.BelongsToSetAssociationMixin<PostInstance, PostInstance["id"]>;
}

/**
 * Build EmojiReactionss Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function EmojiReactionModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<EmojiReactionInstance> {
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
    media_item_id: {
      type: Sequelize.DataTypes.UUIDV4,
      allowNull: false
    },
    user_id: {
      type: Sequelize.DataTypes.UUIDV4,
      allowNull: false
    }
  };

  // Create the model
  const EmojiReaction = sequelize.define<EmojiReactionInstance, EmojiReactionCreationAttributes>("EmojiReaction", attributes, { underscored: true, tableName: TABLE_NAME });

  EmojiReaction.beforeCreate(emoji => { emoji.id = uuidv4(); });

  return EmojiReaction;
}
