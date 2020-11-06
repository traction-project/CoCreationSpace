import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MultimediaAttributes, MultimediaInstance } from "./multimedia";

export interface SubtitlesAttributes extends CommonAttributes{
    language?: string;
    content: string;
    multimedia?: MultimediaAttributes | MultimediaAttributes["id"];
}

type SubtitlesCreationAttributes = Optional<SubtitlesAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Subtitles instance object interface
 */
export interface SubtitlesInstance extends Sequelize.Model<SubtitlesAttributes, SubtitlesCreationAttributes>, SubtitlesAttributes {
  getMultimedia: Sequelize.BelongsToGetAssociationMixin<MultimediaInstance>;
  setMultimedia: Sequelize.BelongsToSetAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
}

/**
 *  Build Subtitles Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function SubtitlesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<SubtitlesInstance> {
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
    content: {
      type: Sequelize.DataTypes.TEXT
    }
  };

  // Create the model
  const Subtitles = sequelize.define<SubtitlesInstance, SubtitlesCreationAttributes>("subtitles", attributes, { underscored: true, tableName: TABLE_NAME });

  Subtitles.beforeCreate(subtitle => { subtitle.id = uuidv4(); });

  return Subtitles;
}
