import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MediaItemInstance } from "./media_item";

export interface VideoChapterAttributes extends CommonAttributes {
  name: string;
  startTime: number;
  mediaItemId?: string;
}


type VideoChapterCollectionCreationAttributes = Optional<VideoChapterAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * VideoChapter instance object interface
 */
export interface VideoChapterInstance extends Sequelize.Model<VideoChapterAttributes, VideoChapterCollectionCreationAttributes>, VideoChapterAttributes {
  getMediaItem: Sequelize.BelongsToGetAssociationMixin<MediaItemInstance>;
  setMediaItem: Sequelize.BelongsToSetAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>
}

/**
 * Build VideoChapter Model object
 * @param sequelize Sequelize: Connection object
 */
export function VideoChapterModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<VideoChapterInstance> {
  //  DB table name
  const TABLE_NAME = "video_chapters";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    createdAt: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DataTypes.DATE,
      defaultValue: Sequelize.NOW,
      allowNull: false
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    startTime: {
      type: Sequelize.DataTypes.DOUBLE,
      allowNull: false
    }
  };

  // Create the model
  const VideoChapter = sequelize.define<VideoChapterInstance, VideoChapterCollectionCreationAttributes>("videoChapter", attributes, { underscored: true, tableName: TABLE_NAME });
  VideoChapter.beforeCreate(videoChapter => { videoChapter.id = uuidv4(); });

  return VideoChapter;
}
