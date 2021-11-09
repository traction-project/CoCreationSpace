import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface LikeAttributes extends Omit<CommonAttributes, "id"> {
    userId: number;
    postId: number;
}

export type LikeCreationAttributes = Optional<LikeAttributes, "createdAt" | "updatedAt">;

/**
 * Like instance object interface
 */
export interface LikeInstance extends Sequelize.Model<LikeAttributes, LikeCreationAttributes>, LikeAttributes {}

/**
 *  Build Like Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function LikeModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<LikeInstance> {
  //  DB table name
  const TABLE_NAME = "likes";
  // Model attributtes
  const attributes = {
    userId : {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    },
    postId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    }
  };

  // Create the model
  const Like = sequelize.define<LikeInstance, LikeCreationAttributes>("like", attributes, { underscored: true, tableName: TABLE_NAME });

  return Like;
}
