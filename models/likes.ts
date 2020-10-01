import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";

export interface LikesAttributes extends commonAttributes{
    user_id: number;
    post_id: number;
}

/**
 * Likes instance object interface
 */
export interface LikesInstance extends Sequelize.Model<LikesAttributes>, LikesAttributes {}

/**
 *  Build Likess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function LikesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<LikesInstance> {
  //  DB table name
  const TABLE_NAME = "likes";
  // Model attributtes
  const attributes = {
    user_id : {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    },
    post_id: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    }
  };

  // Create the model
  const Likes = sequelize.define<LikesInstance>("likes", attributes, { underscored: true, tableName: TABLE_NAME });

  return Likes;
}
