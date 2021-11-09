import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MediaItemAttributes, MediaItemInstance } from "./media_item";
import { MetadataItemAttributes, MetadataItemInstance } from "./metadata_item";

export interface AudioContentAttributes extends CommonAttributes{
    file: string;
    language?: string;
    audioType?: string;
    multimedia?: MediaItemAttributes | MediaItemAttributes["id"];
    metadataItems?: MetadataItemAttributes | MetadataItemAttributes["id"];
}

type AudioContentCreationAttributes = Optional<AudioContentAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * AudioContent instance object interface
 */
export interface AudioContentInstance extends Sequelize.Model<AudioContentAttributes, AudioContentCreationAttributes>, AudioContentAttributes {
  getMediaItem: Sequelize.BelongsToGetAssociationMixin<MediaItemInstance>;
  setMediaItem: Sequelize.BelongsToSetAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;

  getMetadataItems: Sequelize.HasManyGetAssociationsMixin<MetadataItemInstance>;
  countMetadataItems: Sequelize.HasManyCountAssociationsMixin;
  hasMetadataItem: Sequelize.HasManyHasAssociationMixin<MetadataItemInstance, MetadataItemInstance["id"]>;
  hasMetadataItems: Sequelize.HasManyHasAssociationsMixin<MetadataItemInstance, MetadataItemInstance["id"]>;
  setMetadataItems: Sequelize.HasManySetAssociationsMixin<MetadataItemInstance, MetadataItemInstance["id"]>;
  addMetadataItem: Sequelize.HasManyAddAssociationMixin<MetadataItemInstance, MetadataItemInstance["id"]>;
  addMetadataItems: Sequelize.HasManyAddAssociationsMixin<MetadataItemInstance, MetadataItemInstance["id"]>;
  removeMetadataItem: Sequelize.HasManyRemoveAssociationMixin<MetadataItemInstance, MetadataItemInstance["id"]>;
  removeMetadataItems: Sequelize.HasManyRemoveAssociationsMixin<MetadataItemInstance, MetadataItemInstance["id"]>;
  createMetadataItem: Sequelize.HasManyCreateAssociationMixin<MetadataItemInstance>;
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
    audioType: {
      type: Sequelize.DataTypes.STRING
    }
  };
  // Create the model
  const AudioContent = sequelize.define<AudioContentInstance, AudioContentCreationAttributes>("audioContent", attributes, { underscored: true, tableName: TABLE_NAME });

  AudioContent.beforeCreate(audioContent => { audioContent.id = uuidv4(); });

  return AudioContent;
}
