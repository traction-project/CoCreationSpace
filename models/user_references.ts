import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface UserReferencesAttributes extends Omit<CommonAttributes, "id"> {
    user_id: number;
    post_id: number;
}

type UserReferencesCreationAttribute = Optional<UserReferencesAttributes, "createdAt" | "updatedAt">;

/**
 * UserReferences instance object interface
 */
export interface UserReferencesInstance extends Sequelize.Model<UserReferencesAttributes, UserReferencesCreationAttribute>, UserReferencesAttributes {}

/**
 *  Build UserReferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function UserReferencesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserReferencesInstance> {
  //  DB table name
  const TABLE_NAME = "user_references";
  // Model attributtes
  const attributes = {
    user_id: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    },
    post_id: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    }
  };

  // Create the model
  const UserReferences = sequelize.define<UserReferencesInstance, UserReferencesCreationAttribute>("userReferences", attributes, { underscored: true, tableName: TABLE_NAME });

  return UserReferences;
}
