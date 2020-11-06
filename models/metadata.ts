import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MultimediaAttributes, MultimediaInstance } from "./multimedia";
import { AudioContentAttributes, AudioContentInstance } from "./audio_content";

export interface MetadataAttributes extends CommonAttributes {
    metadata_type?: string;
    value: string;
    roi?: string;
    time_interval?: string;
    multimedia?: MultimediaAttributes | MultimediaAttributes["id"];
    audioContent?: AudioContentAttributes | AudioContentAttributes["id"];
}

type MetadataCreationAttributes = Optional<MetadataAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Metadata instance object interface
 */
export interface MetadataInstance extends Sequelize.Model<MetadataAttributes, MetadataCreationAttributes>, MetadataAttributes {
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
  //  DB table name
  const TABLE_NAME = "metadata";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
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
      type: Sequelize.DataTypes.UUID
    },
    audio_content_id: {
      type: Sequelize.DataTypes.UUID
    }
  };

  // Create the model
  const Metadata = sequelize.define<MetadataInstance, MetadataCreationAttributes>("metadata", attributes, { underscored: true, tableName: TABLE_NAME });

  Metadata.beforeCreate(metadata => { metadata.id = uuidv4(); });

  return Metadata;
}
