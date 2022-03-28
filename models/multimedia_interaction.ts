import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UserInstance, UserAttributes } from "./user";
import { MediaItemInstance, MediaItemAttributes } from "./media_item";

export interface MultimediaInteractionAttributes extends CommonAttributes {
  mediaItem: MediaItemAttributes | MediaItemAttributes["id"];
  user: UserAttributes | UserAttributes["id"];
  interaction: { type: string, timestamp: number };
}

type MultimediaInteractionCreationAttributes = Optional<
  MultimediaInteractionAttributes,
  "id" | "createdAt" | "updatedAt" | "mediaItem" | "user"
>

/**
 * MultimediaInteraction instance object interface
 */
export interface MultimediaInteractionInstance extends Sequelize.Model<MultimediaInteractionAttributes, MultimediaInteractionCreationAttributes>, MultimediaInteractionAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
  createUser: Sequelize.BelongsToCreateAssociationMixin<UserInstance>;

  getMediaItem: Sequelize.BelongsToGetAssociationMixin<MediaItemInstance>;
  setMediaItem: Sequelize.BelongsToSetAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
  createMediaItem: Sequelize.BelongsToCreateAssociationMixin<MediaItemInstance>;
}

/**
 * Build MultimediaInteraction model object
 *
 * @param sequelize Sequelize: Database connection object
 */
export function MultimediaInteractionModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<MultimediaInteractionInstance> {
  //  DB table name
  const TABLE_NAME = "multimedia_interactions";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    interaction: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    }
  };

  // Create the model
  const MultimediaInteraction = sequelize.define<MultimediaInteractionInstance, MultimediaInteractionCreationAttributes>("multimediaInteraction", attributes, { underscored: true, tableName: TABLE_NAME });
  MultimediaInteraction.beforeCreate(group => { group.id = uuidv4(); });

  return MultimediaInteraction;
}
