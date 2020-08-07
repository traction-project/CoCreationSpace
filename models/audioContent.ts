import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { MultimediaAttributes, MultimediaInstance } from "./multimedia";
import { MetadataAttributes, MetadataInstance } from "./metadata";

export interface AudioContentAttributes extends commonAttributes{
    file: string;
    language?: string;
    audio_type?: string;
    multimedia?: MultimediaAttributes | MultimediaAttributes["id"];
    metadata?: MetadataAttributes | MetadataAttributes["id"];
}

/**
 * AudioContent instance object interface
 */
export interface AudioContentInstance extends Sequelize.Model<AudioContentAttributes>, AudioContentAttributes {
  getMultimedia: Sequelize.BelongsToGetAssociationMixin<MultimediaInstance>;
  setMultimedia: Sequelize.BelongsToSetAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;

  getMetadata: Sequelize.HasManyGetAssociationsMixin<MetadataInstance>;
  setMetadata: Sequelize.HasManySetAssociationsMixin<MetadataInstance, MetadataInstance["id"]>;
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
  // Model attributtes
  const attributes = {
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
  const AudioContent = sequelize.define<AudioContentInstance>("audioContent", attributes, { underscored: true, tableName: "audio_content" });

  return AudioContent;
}
