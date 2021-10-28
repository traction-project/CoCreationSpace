import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { MultimediaInstance, MultimediaAttributes } from "./multimedia";

export interface AsyncJobAttributes extends CommonAttributes{
    type: string;
    status: string;
    jobId: string;
    multimedia?: MultimediaAttributes | MultimediaAttributes["id"];
}

type AsyncJobCreationAttributes = Optional<AsyncJobAttributes, "id" | "createdAt" | "updatedAt" | "status">;

/**
 * AsyncJobs instance object interface
 */
export interface AsyncJobInstance extends Sequelize.Model<AsyncJobAttributes, AsyncJobCreationAttributes>, AsyncJobAttributes {
  getMultimedium: Sequelize.BelongsToGetAssociationMixin<MultimediaInstance>;
  setMultimedium: Sequelize.BelongsToSetAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
  createMultimedium: Sequelize.BelongsToCreateAssociationMixin<MultimediaInstance>;
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
  const AsyncJob = sequelize.define<AsyncJobInstance, AsyncJobCreationAttributes>("AsyncJob", attributes, { underscored: true, tableName: TABLE_NAME });

  AsyncJob.beforeCreate((asyncJob) => { asyncJob.id = uuidv4(); });

  return AsyncJob;
}
