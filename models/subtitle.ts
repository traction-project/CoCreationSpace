import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MediaItemAttributes, MediaItemInstance } from "./media_item";

export interface SubtitleAttributes extends CommonAttributes{
    language?: string;
    content: string;
    confidence?: number;
    mediaItem?: MediaItemAttributes | MediaItemAttributes["id"];
}

type SubtitleCreationAttributes = Optional<SubtitleAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Subtitles instance object interface
 */
export interface SubtitleInstance extends Sequelize.Model<SubtitleAttributes, SubtitleCreationAttributes>, SubtitleAttributes {
  getMediaItem: Sequelize.BelongsToGetAssociationMixin<MediaItemInstance>;
  setMediaItem: Sequelize.BelongsToSetAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;

  isDefault: () => boolean;
}

/**
 *  Build Subtitles Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function SubtitleModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<SubtitleInstance> {
  //  DB table name
  const TABLE_NAME = "subtitles";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    language: {
      type: Sequelize.DataTypes.STRING
    },
    confidence: {
      type: Sequelize.DataTypes.FLOAT
    },
    content: {
      type: Sequelize.DataTypes.TEXT
    }
  };

  // Create the model
  const Subtitle = sequelize.define<SubtitleInstance, SubtitleCreationAttributes>("subtitle", attributes, { underscored: true, tableName: TABLE_NAME });

  Subtitle.prototype.isDefault = function () {
    return !!this.confidence;
  };

  Subtitle.beforeCreate(subtitle => { subtitle.id = uuidv4(); });

  return Subtitle;
}
