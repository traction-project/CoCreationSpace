import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MediaItemInstance, MediaItemAttributes } from "./media_item";

export interface AsyncJobAttributes extends CommonAttributes{
  type: string;
  status: string;
  jobId: string;
  mediaItem?: MediaItemAttributes | MediaItemAttributes["id"];
}

type AsyncJobCreationAttributes = Optional<AsyncJobAttributes, "id" | "createdAt" | "updatedAt" | "status">;

/**
 * AsyncJobs instance object interface
 */
export interface AsyncJobInstance extends Sequelize.Model<AsyncJobAttributes, AsyncJobCreationAttributes>, AsyncJobAttributes {
  getMediaItem: Sequelize.BelongsToGetAssociationMixin<MediaItemInstance>;
  setMediaItem: Sequelize.BelongsToSetAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
  createMediaItem: Sequelize.BelongsToCreateAssociationMixin<MediaItemInstance>;
}

/**
 * Build AsyncJob Model object
 * @param sequelize Sequelize object which manages the connection
 */
export function AsyncJobModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<AsyncJobInstance> {
  // DB table name
  const TABLE_NAME = "async_jobs";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    type: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: Sequelize.DataTypes.STRING,
      defaultValue: "processing"
    },
    jobId: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
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
    }
  };

  // Create the model
  const AsyncJob = sequelize.define<AsyncJobInstance, AsyncJobCreationAttributes>("asyncJob", attributes, { underscored: true, tableName: TABLE_NAME });

  AsyncJob.beforeCreate((asyncJob) => { asyncJob.id = uuidv4(); });

  return AsyncJob;
}
