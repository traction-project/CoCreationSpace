import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { MultimediaAttributes, MultimediaInstance } from "./multimedia";
import { AudioContentAttributes, AudioContentInstance } from "./audioContent";

export interface MetadataAttributes extends commonAttributes{
    metadata_type?: string;
    value: string;
    roi?: string;
    time_interval?: string;
    multimedia?: MultimediaAttributes | MultimediaAttributes["id"];
    audioContent?: AudioContentAttributes | AudioContentAttributes["id"];
}

/**
 * Metadata instance object interface
 */
export interface MetadataInstance extends Sequelize.Model<MetadataAttributes>, MetadataAttributes {
  getMultimedia: Sequelize.BelongsToGetAssociationMixin<MultimediaInstance>;
  setMultimedia: Sequelize.BelongsToSetAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;

  getAudioContent: Sequelize.BelongsToGetAssociationMixin<AudioContentInstance>;
  setAudioContent: Sequelize.BelongsToSetAssociationMixin<AudioContentInstance, AudioContentInstance["id"]>;
}

/**
 *  Build Metadatas Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function MetadataModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<MetadataInstance> {
  // Model attributtes
  const attributes = {
    metadata_type: {
      type: Sequelize.DataTypes.STRING
    },
    value: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    roi: {
      type: Sequelize.DataTypes.STRING
    },
    time_interval: {
      type: Sequelize.DataTypes.STRING
    },
    multimedia_id: {
      type: Sequelize.DataTypes.INTEGER
    },
    audio_content_id: {
      type: Sequelize.DataTypes.INTEGER
    }
  };
  
  // Create the model
  const Metadata = sequelize.define<MetadataInstance>("metadata", attributes, { underscored: true, tableName: "metadata" });

  return Metadata;
}
