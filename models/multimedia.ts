import { Model, Sequelize, DataTypes, ModelCtor, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin } from "sequelize";

import { commonAttributes } from "typings/modelCommonAttributes";
import { UsersAttributes, UserInstance } from "./users";
import { TranscribeOutput } from "util/transcribe";

export interface MultimediaAttributes extends commonAttributes {
    title: string;
    file: string;
    status: string;
    transcodingJobId: string,
    transcriptionJobId: string,
    thumbnails: Array<string>,
    key: string;
    transcript: TranscribeOutput;
    media_properties?: string;
    detected_properties?: string;
    audio_descriptions?: string;
    duration: number;
    resolutions: Array<number>;
    type: string;
    user?: UsersAttributes | UsersAttributes["id"];
}

export interface MultimediaInstance extends Model<MultimediaAttributes>, MultimediaAttributes {
    getUser: BelongsToGetAssociationMixin<UserInstance>;
    setUser: BelongsToSetAssociationMixin<UserInstance, UserInstance["id"]>;
}

export function MultimediaModelFactory(sequelize: Sequelize): ModelCtor<MultimediaInstance> {
  const attributes = {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM,
      values: ["pending", "processing", "done", "error"],
      defaultValue: "pending"
    },
    transcodingJobId: {
      type: DataTypes.STRING
    },
    transcriptionJobId: {
      type: DataTypes.STRING
    },
    thumbnails: {
      type: DataTypes.ARRAY(DataTypes.STRING)
    },
    key: {
      type: DataTypes.STRING
    },
    transcript: {
      type: DataTypes.JSON
    },
    media_properties: {
      type: DataTypes.STRING
    },
    detected_properties: {
      type: DataTypes.STRING
    },
    audio_descriptions: {
      type: DataTypes.STRING
    },
    duration: {
      type: DataTypes.INTEGER
    },
    resolutions: {
      type: DataTypes.ARRAY(DataTypes.INTEGER)
    },
    type: {
      type: DataTypes.STRING
    }
  };

  const Multimedia = sequelize.define<MultimediaInstance, MultimediaAttributes>("multimedia", attributes, { underscored: true, tableName: "multimedia" });

  return Multimedia;
}
