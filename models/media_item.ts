import Sequelize, { Optional, Op } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "../util/typing/modelCommonAttributes";
import { UserAttributes, UserInstance } from "./user";
import { TranscribeOutput } from "../util/transcribe";
import { OCRLine } from "../util";

import { DataContainerAttributes, DataContainerInstance } from "./data_container";
import { AudioContentAttributes, AudioContentInstance } from "./audio_content";
import { MetadataItemAttributes, MetadataItemInstance } from "./metadata_item";
import { SubtitleAttributes, SubtitleInstance } from "./subtitle";
import { MultimediaInteractionInstance } from "./multimedia_interaction";
import { EmojiReactionAttributes, EmojiReactionInstance } from "./emoji_reaction";
import { AsyncJobInstance } from "./async_job";
import { NoteCollectionInstance } from "./note_collection";

export interface MediaItemAttributes extends CommonAttributes {
  title: string;
  file?: string;
  status?: string;
  transcodingJobId?: string;
  transcriptionJobId?: string;
  thumbnails?: Array<string>;
  key?: string;
  transcript?: TranscribeOutput;
  mediaProperties?: string;
  detectedProperties?: string;
  audioDescriptions?: string;
  duration?: number;
  resolutions?: Array<number>;
  viewCount?: number;
  ocrData?: Array<OCRLine>;
  type?: string;
  user?: UserAttributes | UserAttributes["id"];
  dataContainer?: DataContainerAttributes | DataContainerAttributes["id"];
  audioContent?: AudioContentAttributes | AudioContentAttributes["id"];
  metadata?: MetadataItemAttributes | MetadataItemAttributes["id"];
  subtitle?: SubtitleAttributes | SubtitleAttributes["id"];
  emojiReactions?: EmojiReactionAttributes | EmojiReactionAttributes["id"];
}

type MediaItemCreationAttributes = Optional<MediaItemAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Multimedia instance object interface
 */
export interface MediaItemInstance extends Sequelize.Model<MediaItemAttributes, MediaItemCreationAttributes>, MediaItemAttributes {
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

  getNoteCollections: Sequelize.BelongsToManyGetAssociationsMixin<NoteCollectionInstance>;
  countNoteCollections: Sequelize.BelongsToManyCountAssociationsMixin;
  hasNoteCollection: Sequelize.BelongsToManyHasAssociationMixin<NoteCollectionInstance, NoteCollectionInstance["id"]>;
  hasNoteCollections: Sequelize.BelongsToManyHasAssociationsMixin<NoteCollectionInstance, NoteCollectionInstance["id"]>;
  setNoteCollections: Sequelize.BelongsToManySetAssociationsMixin<NoteCollectionInstance, NoteCollectionInstance["id"]>;
  addNoteCollection: Sequelize.BelongsToManyAddAssociationMixin<NoteCollectionInstance, NoteCollectionInstance["id"]>;
  addNoteCollections: Sequelize.BelongsToManyAddAssociationsMixin<NoteCollectionInstance, NoteCollectionInstance["id"]>;
  removeNoteCollection: Sequelize.BelongsToManyRemoveAssociationMixin<NoteCollectionInstance, NoteCollectionInstance["id"]>;
  removeNoteCollections: Sequelize.BelongsToManyRemoveAssociationsMixin<NoteCollectionInstance, NoteCollectionInstance["id"]>;
  createNoteCollection: Sequelize.BelongsToManyCreateAssociationMixin<NoteCollectionInstance>;

  incrementViewCount: () => Promise<void>;
  isDoneTranscoding: () => Promise<boolean>;
}

/**
 *  Build Multimedia Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function MediaItemModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<MediaItemInstance> {
  //  DB table name
  const TABLE_NAME = "media_items";

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
    mediaProperties: {
      type: Sequelize.DataTypes.STRING
    },
    detectedProperties: {
      type: Sequelize.DataTypes.STRING
    },
    audioDescriptions: {
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
    },
    ocrData: {
      type: Sequelize.DataTypes.JSON
    }
  };

  // Create the model
  const MediaItem = sequelize.define<MediaItemInstance, MediaItemCreationAttributes>("mediaItem", attributes, { underscored: true, tableName: TABLE_NAME });

  MediaItem.beforeCreate(multimedia => { multimedia.id = uuidv4(); });

  MediaItem.prototype.incrementViewCount = async function () {
    await this.increment("viewCount");
    await this.reload();
  };

  MediaItem.prototype.isDoneTranscoding = async function () {
    const processingJobCount = await this.countAsyncJobs({
      where: {
        type: { [Op.like]: "transcode_%" },
        status: "processing"
      }
    });

    return processingJobCount == 0;
  };

  return MediaItem;
}
