import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MediaItemAttributes, MediaItemInstance } from "./media_item";
import { AudioContentAttributes, AudioContentInstance } from "./audio_content";

export interface MetadataItemAttributes extends CommonAttributes {
  metadataType?: string;
  value: string;
  roi?: string;
  timeInterval?: string;
  multimedia?: MediaItemAttributes | MediaItemAttributes["id"];
  audioContent?: AudioContentAttributes | AudioContentAttributes["id"];
}

type MetadataItemCreationAttributes = Optional<MetadataItemAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Metadata instance object interface
 */
export interface MetadataItemInstance extends Sequelize.Model<MetadataItemAttributes, MetadataItemCreationAttributes>, MetadataItemAttributes {
  getMediaItem: Sequelize.BelongsToGetAssociationMixin<MediaItemInstance>;
  setMediaItem: Sequelize.BelongsToSetAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;

  getAudioContent: Sequelize.BelongsToGetAssociationMixin<AudioContentInstance>;
  setAudioContent: Sequelize.BelongsToSetAssociationMixin<AudioContentInstance, AudioContentInstance["id"]>;
}

/**
 *  Build Metadatas Model object
 * @param sequelize Sequelize: Database connection object
 */
export function MetadataItemModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<MetadataItemInstance> {
  //  DB table name
  const TABLE_NAME = "metadata_items";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    metadataType: {
      type: Sequelize.DataTypes.STRING
    },
    value: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    roi: {
      type: Sequelize.DataTypes.STRING
    },
    timeInterval: {
      type: Sequelize.DataTypes.STRING
    },
    mediaItemId: {
      type: Sequelize.DataTypes.UUID
    },
    audioContentId: {
      type: Sequelize.DataTypes.UUID
    }
  };

  // Create the model
  const MetadataItem = sequelize.define<MetadataItemInstance, MetadataItemCreationAttributes>("metadataItem", attributes, { underscored: true, tableName: TABLE_NAME });

  MetadataItem.beforeCreate(metadata => { metadata.id = uuidv4(); });

  return MetadataItem;
}
