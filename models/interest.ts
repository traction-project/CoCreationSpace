import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface InterestAttributes extends Omit<CommonAttributes, "id"> {
    user_id: number;
    topic_id: number;
}

type InterestCreationAttributes = Optional<InterestAttributes, "createdAt" | "updatedAt">

/**
 * Likes instance object interface
 */
export interface InterestInstance extends Sequelize.Model<InterestAttributes, InterestCreationAttributes>, InterestAttributes {}

/**
 *  Build Interest Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function InterestModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<InterestInstance> {
  //  DB table name
  const TABLE_NAME = "interests";
  // Model attributtes
  const attributes = {
    user_id : {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    },
    topic_id: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    }
  };

  // Create the model
  const Interest = sequelize.define<InterestInstance, InterestCreationAttributes>("interest", attributes, { underscored: true, tableName: TABLE_NAME });

  return Interest;
}
