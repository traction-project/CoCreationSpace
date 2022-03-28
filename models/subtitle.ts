import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MediaItemAttributes, MediaItemInstance } from "./media_item";

export interface SubtitleAttributes extends CommonAttributes{
  language?: string;
  content: string;
  confidence?: number;
  mediaItem?: MediaItemAttributes | MediaItemAttributes["id"];
  readonly default: boolean;
}

type SubtitleCreationAttributes = Optional<SubtitleAttributes, "id" | "createdAt" | "updatedAt" | "default">;

/**
 * Subtitles instance object interface
 */
export interface SubtitleInstance extends Sequelize.Model<SubtitleAttributes, SubtitleCreationAttributes>, SubtitleAttributes {
  getMediaItem: Sequelize.BelongsToGetAssociationMixin<MediaItemInstance>;
  setMediaItem: Sequelize.BelongsToSetAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
}

/**
 *  Build Subtitles Model object
 * @param sequelize Sequelize: Database connection object
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
    },
    default: {
      type: Sequelize.DataTypes.VIRTUAL,
      get(this: SubtitleInstance) {
        return !!this.confidence;
      },
      set() {
        throw new Error("Property is not assignable");
      }
    }
  };

  // Create the model
  const Subtitle = sequelize.define<SubtitleInstance, SubtitleCreationAttributes>("subtitle", attributes, { underscored: true, tableName: TABLE_NAME });

  Subtitle.beforeCreate(subtitle => { subtitle.id = uuidv4(); });

  return Subtitle;
}
