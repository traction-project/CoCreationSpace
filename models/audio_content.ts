import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MultimediaAttributes, MultimediaInstance } from "./multimedia";
import { MetadataAttributes, MetadataInstance } from "./metadata";

export interface AudioContentAttributes extends CommonAttributes{
    file: string;
    language?: string;
    audio_type?: string;
    multimedia?: MultimediaAttributes | MultimediaAttributes["id"];
    metadatas?: MetadataAttributes | MetadataAttributes["id"];
}

type AudioContentCreationAttributes = Optional<AudioContentAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * AudioContent instance object interface
 */
export interface AudioContentInstance extends Sequelize.Model<AudioContentAttributes, AudioContentCreationAttributes>, AudioContentAttributes {
  getMultimedia: Sequelize.BelongsToGetAssociationMixin<MultimediaInstance>;
  setMultimedia: Sequelize.BelongsToSetAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;

  getMetadatas: Sequelize.HasManyGetAssociationsMixin<MetadataInstance>;
  setMetadatas: Sequelize.HasManySetAssociationsMixin<MetadataInstance, MetadataInstance["id"]>;
  addMetadatas: Sequelize.HasManyAddAssociationsMixin<MetadataInstance, MetadataInstance["id"]>;
  addMetadata: Sequelize.HasManyAddAssociationMixin<MetadataInstance, MetadataInstance["id"]>;
  createMetadata: Sequelize.HasManyCreateAssociationMixin<MetadataInstance>;
  removeMetadata: Sequelize.HasManyRemoveAssociationMixin<MetadataInstance, MetadataInstance["id"]>;
  removeMetadatas: Sequelize.HasManyRemoveAssociationsMixin<MetadataInstance, MetadataInstance["id"]>;
  hasMetadata: Sequelize.HasManyHasAssociationMixin<MetadataInstance, MetadataInstance["id"]>;
  hasMetadatas: Sequelize.HasManyHasAssociationsMixin<MetadataInstance, MetadataInstance["id"]>;
  countMetadatas: Sequelize.HasManyCountAssociationsMixin;
}

/**
 *  Build AudioContents Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function AudioContentModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<AudioContentInstance> {
  // DB table name
  const TABLE_NAME = "audio_content";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    file: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    language: {
      type: Sequelize.DataTypes.STRING
    },
    audio_type: {
      type: Sequelize.DataTypes.STRING
    }
  };
  // Create the model
  const AudioContent = sequelize.define<AudioContentInstance, AudioContentCreationAttributes>("audioContent", attributes, { underscored: true, tableName: TABLE_NAME });

  AudioContent.beforeCreate(audioContent => { audioContent.id = uuidv4(); });

  return AudioContent;
}
