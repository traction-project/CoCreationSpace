import Sequelize, { Optional, Op } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { UsersAttributes, UserInstance } from "./users";
import { TranscribeOutput } from "util/transcribe";
import { DataContainerAttributes, DataContainerInstance } from "./data_container";
import { AudioContentAttributes, AudioContentInstance } from "./audio_content";
import { MetadataAttributes, MetadataInstance } from "./metadata";
import { SubtitleAttributes, SubtitleInstance } from "./subtitle";
import { MultimediaInteractionInstance } from "./multimedia_interaction";
import { EmojiReactionAttributes, EmojiReactionInstance } from "./emoji_reaction";
import { AsyncJobInstance } from "./async_job";

export interface MultimediaAttributes extends CommonAttributes {
  title: string;
  file?: string;
  status?: string;
  transcodingJobId?: string;
  transcriptionJobId?: string;
  thumbnails?: Array<string>;
  key?: string;
  transcript?: TranscribeOutput;
  media_properties?: string;
  detected_properties?: string;
  audio_descriptions?: string;
  duration?: number;
  resolutions?: Array<number>;
  viewCount?: number;
  type?: string;
  user?: UsersAttributes | UsersAttributes["id"];
  dataContainer?: DataContainerAttributes | DataContainerAttributes["id"];
  audioContent?: AudioContentAttributes | AudioContentAttributes["id"];
  metadata?: MetadataAttributes | MetadataAttributes["id"];
  subtitle?: SubtitleAttributes | SubtitleAttributes["id"];
  emojiReactions?: EmojiReactionAttributes | EmojiReactionAttributes["id"];
}

type MultimediaCreationAttributes = Optional<MultimediaAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Multimedia instance object interface
 */
export interface MultimediaInstance extends Sequelize.Model<MultimediaAttributes, MultimediaCreationAttributes>, MultimediaAttributes {
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

  getSubtitles: Sequelize.HasManyGetAssociationsMixin<SubtitleInstance>;
  countSubtitles: Sequelize.HasManyCountAssociationsMixin;
  hasSubtitle: Sequelize.HasManyHasAssociationMixin<SubtitleInstance, SubtitleInstance["id"]>;
  hasSubtitles: Sequelize.HasManyHasAssociationsMixin<SubtitleInstance, SubtitleInstance["id"]>;
  setSubtitles: Sequelize.HasManySetAssociationsMixin<SubtitleInstance, SubtitleInstance["id"]>;
  addSubtitle: Sequelize.HasManyAddAssociationMixin<SubtitleInstance, SubtitleInstance["id"]>;
  addSubtitles: Sequelize.HasManyAddAssociationsMixin<SubtitleInstance, SubtitleInstance["id"]>;
  removeSubtitle: Sequelize.HasManyRemoveAssociationMixin<SubtitleInstance, SubtitleInstance["id"]>;
  removeSubtitles: Sequelize.HasManyRemoveAssociationsMixin<SubtitleInstance, SubtitleInstance["id"]>;
  createSubtitle: Sequelize.HasManyCreateAssociationMixin<SubtitleInstance>;

  getMultimediaInteractions: Sequelize.HasManyGetAssociationsMixin<MultimediaInteractionInstance>;
  setMultimediaInteractions: Sequelize.HasManySetAssociationsMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  addMultimediaInteractions: Sequelize.HasManyAddAssociationsMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  addMultimediaInteraction: Sequelize.HasManyAddAssociationMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  removeMultimediaInteraction: Sequelize.HasManyRemoveAssociationMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  removeMultimediaInteractions: Sequelize.HasManyRemoveAssociationsMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  hasMultimediaInteraction: Sequelize.HasManyHasAssociationMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  hasMultimediaInteractions: Sequelize.HasManyHasAssociationsMixin<MultimediaInteractionInstance, MultimediaInteractionInstance["id"]>;
  countMultimediaInteractions: Sequelize.HasManyCountAssociationsMixin;

  getEmojiReactions: Sequelize.HasManyGetAssociationsMixin<EmojiReactionInstance>;
  setEmojiReactions: Sequelize.HasManySetAssociationsMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  addEmojiReactions: Sequelize.HasManyAddAssociationsMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  addEmojiReaction: Sequelize.HasManyAddAssociationMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  removeEmojiReaction: Sequelize.HasManyRemoveAssociationMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  removeEmojiReactions: Sequelize.HasManyRemoveAssociationsMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  hasEmojiReaction: Sequelize.HasManyHasAssociationMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  hasEmojiReactions: Sequelize.HasManyHasAssociationsMixin<EmojiReactionInstance, EmojiReactionInstance["id"]>;
  countEmojiReactions: Sequelize.HasManyCountAssociationsMixin;

  getAsyncJobs: Sequelize.HasManyGetAssociationsMixin<AsyncJobInstance>;
  setAsyncJobs: Sequelize.HasManySetAssociationsMixin<AsyncJobInstance, AsyncJobInstance["id"]>;
  addAsyncJobs: Sequelize.HasManyAddAssociationsMixin<AsyncJobInstance, AsyncJobInstance["id"]>;
  addAsyncJob: Sequelize.HasManyAddAssociationMixin<AsyncJobInstance, AsyncJobInstance["id"]>;
  removeAsyncJob: Sequelize.HasManyRemoveAssociationMixin<AsyncJobInstance, AsyncJobInstance["id"]>;
  removeAsyncJobs: Sequelize.HasManyRemoveAssociationsMixin<AsyncJobInstance, AsyncJobInstance["id"]>;
  hasAsyncJob: Sequelize.HasManyHasAssociationMixin<AsyncJobInstance, AsyncJobInstance["id"]>;
  hasAsyncJobs: Sequelize.HasManyHasAssociationsMixin<AsyncJobInstance, AsyncJobInstance["id"]>;
  countAsyncJobs: Sequelize.HasManyCountAssociationsMixin;

  incrementViewCount: () => Promise<void>;
  isDoneTranscoding: () => Promise<boolean>;
}

/**
 *  Build Multimedia Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function MultimediaModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<MultimediaInstance> {
  //  DB table name
  const TABLE_NAME = "multimedia";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
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
      type: Sequelize.DataTypes.JSON
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
      type: Sequelize.DataTypes.JSON
    },
    type: {
      type: Sequelize.DataTypes.STRING
    },
    viewCount: {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0
    }
  };

  // Create the model
  const Multimedia = sequelize.define<MultimediaInstance, MultimediaCreationAttributes>("multimedia", attributes, { underscored: true, tableName: TABLE_NAME });

  Multimedia.beforeCreate(multimedia => { multimedia.id = uuidv4(); });

  Multimedia.prototype.incrementViewCount = async function () {
    await this.increment("viewCount");
    await this.reload();
  };

  Multimedia.prototype.isDoneTranscoding = async function () {
    const processingJobCount = await this.countAsyncJobs({
      where: {
        type: { [Op.like]: "transcode_%" },
        status: "processing"
      }
    });

    return processingJobCount == 0;
  };

  return Multimedia;
}
