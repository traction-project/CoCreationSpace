import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { UsersAttributes, UserInstance } from "./users";
import { TranscribeOutput } from "util/transcribe";
import { DataContainerAttributes, DataContainerInstance } from "./dataContainer";
import { AudioContentAttributes, AudioContentInstance } from "./audioContent";
import { MetadataAttributes, MetadataInstance } from "./metadata";
import { SubtitlesAttributes, SubtitlesInstance } from "./subtitles";

export interface MultimediaAttributes extends commonAttributes {
  title: string;
  file: string;
  status?: string;
  transcodingJobId?: string,
  transcriptionJobId?: string,
  thumbnails?: Array<string>,
  key?: string;
  transcript?: TranscribeOutput;
  media_properties?: string;
  detected_properties?: string;
  audio_descriptions?: string;
  duration?: number;
  resolutions?: Array<number>;
  type?: string;
  user?: UsersAttributes | UsersAttributes["id"];
  dataContainer?: DataContainerAttributes | DataContainerAttributes["id"];
  audioContent?: AudioContentAttributes | AudioContentAttributes["id"];
  metadata?: MetadataAttributes | MetadataAttributes["id"];
  subtitle?: SubtitlesAttributes | SubtitlesAttributes["id"];
}

/**
 * Multimedia instance object interface
 */
export interface MultimediaInstance extends Sequelize.Model<MultimediaAttributes>, MultimediaAttributes {
  getUser: Sequelize.BelongsToGetAssociationMixin<UserInstance>; // Return the User that created the multimedia
  setUser: Sequelize.BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>; // Set the user that created the multimedia

  getDataContainer: Sequelize.BelongsToGetAssociationMixin<DataContainerInstance>;
  setDataContainer: Sequelize.BelongsToSetAssociationMixin<DataContainerInstance, DataContainerInstance["id"]>;

  getAudioContent: Sequelize.HasManyGetAssociationsMixin<AudioContentInstance>;
  setAudioContent: Sequelize.HasManySetAssociationsMixin<AudioContentInstance, AudioContentInstance["id"]>;
  addAudioContents: Sequelize.HasManyAddAssociationsMixin<AudioContentInstance, AudioContentInstance["id"]>;
  addAudioContent: Sequelize.HasManyAddAssociationMixin<AudioContentInstance, AudioContentInstance["id"]>;
  createAudioContent: Sequelize.HasManyCreateAssociationMixin<AudioContentInstance>;
  removeAudioContent: Sequelize.HasManyRemoveAssociationMixin<AudioContentInstance, AudioContentInstance["id"]>;
  removeAudioContents: Sequelize.HasManyRemoveAssociationsMixin<AudioContentInstance, AudioContentInstance["id"]>;
  hasAudioContent: Sequelize.HasManyHasAssociationMixin<AudioContentInstance, AudioContentInstance["id"]>;
  hasAudioContents: Sequelize.HasManyHasAssociationsMixin<AudioContentInstance, AudioContentInstance["id"]>;
  countAudioContents: Sequelize.HasManyCountAssociationsMixin;

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

  getSubtitle: Sequelize.HasManyGetAssociationsMixin<SubtitlesInstance>;
  setSubtitle: Sequelize.HasManySetAssociationsMixin<SubtitlesInstance, SubtitlesInstance["id"]>;
  addSubtitles: Sequelize.HasManyAddAssociationsMixin<SubtitlesInstance, SubtitlesInstance["id"]>;
  addSubtitle: Sequelize.HasManyAddAssociationMixin<SubtitlesInstance, SubtitlesInstance["id"]>;
  createSubtitle: Sequelize.HasManyCreateAssociationMixin<SubtitlesInstance>;
  removeSubtitle: Sequelize.HasManyRemoveAssociationMixin<SubtitlesInstance, SubtitlesInstance["id"]>;
  removeSubtitles: Sequelize.HasManyRemoveAssociationsMixin<SubtitlesInstance, SubtitlesInstance["id"]>;
  hasSubtitle: Sequelize.HasManyHasAssociationMixin<SubtitlesInstance, SubtitlesInstance["id"]>;
  hasSubtitles: Sequelize.HasManyHasAssociationsMixin<SubtitlesInstance, SubtitlesInstance["id"]>;
  countSubtitles: Sequelize.HasManyCountAssociationsMixin;
}

/**
 *  Build Multimedia Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function MultimediaModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<MultimediaInstance> {
  // Model attributtes
  const attributes = {
    title: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    file: {
      type: Sequelize.DataTypes.STRING
    },
    status: {
      type: Sequelize.DataTypes.ENUM,
      values: ["pending", "processing", "done", "error"],
      defaultValue: "pending"
    },
    transcodingJobId: {
      type: Sequelize.DataTypes.STRING
    },
    transcriptionJobId: {
      type: Sequelize.DataTypes.STRING
    },
    thumbnails: {
      type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING)
    },
    key: {
      type: Sequelize.DataTypes.STRING
    },
    transcript: {
      type: Sequelize.DataTypes.JSON
    },
    media_properties: {
      type: Sequelize.DataTypes.STRING
    },
    detected_properties: {
      type: Sequelize.DataTypes.STRING
    },
    audio_descriptions: {
      type: Sequelize.DataTypes.STRING
    },
    duration: {
      type: Sequelize.DataTypes.INTEGER
    },
    resolutions: {
      type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
    },
    type: {
      type: Sequelize.DataTypes.STRING
    }
  };

  // Create the model
  const Multimedia = sequelize.define<MultimediaInstance, MultimediaAttributes>("multimedia", attributes, { underscored: true, tableName: "multimedia" });

  return Multimedia;
}
