import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";

export interface UserReferencesAttributes extends commonAttributes{
    user_id: number;
    post_id: number;
}

/**
 * UserReferences instance object interface
 */
export interface UserReferencesInstance extends Sequelize.Model<UserReferencesAttributes>, UserReferencesAttributes {}

/**
 *  Build UserReferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function UserReferencesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserReferencesInstance> {
  // Model attributtes
  const attributes = {
    user_id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    post_id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    }
  };
  
  // Create the model
  const UserReferences = sequelize.define<UserReferencesInstance>("userReferences", attributes, { underscored: true, tableName: "user_references" });

  return UserReferences;
}
