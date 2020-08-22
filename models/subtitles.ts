import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { MultimediaAttributes, MultimediaInstance } from "./multimedia";

export interface SubtitlesAttributes extends commonAttributes{
    language?: string;
    file: string;
    multimedia?: MultimediaAttributes | MultimediaAttributes["id"];
}

/**
 * Subtitles instance object interface
 */
export interface SubtitlesInstance extends Sequelize.Model<SubtitlesAttributes>, SubtitlesAttributes {
  getMultimedia: Sequelize.BelongsToGetAssociationMixin<MultimediaInstance>;
  setMultimedia: Sequelize.BelongsToSetAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
}

/**
 *  Build Subtitles Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function SubtitlesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<SubtitlesInstance> {
  // Model attributtes
  const attributes = {
    language: {
      type: Sequelize.DataTypes.STRING
    },
    file: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    }
  };

  // Create the model
  const Subtitles = sequelize.define<SubtitlesInstance>("subtitles", attributes, { underscored: true, tableName: "subtitles" });

  return Subtitles;
}
