import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface UserReferenceAttributes extends Omit<CommonAttributes, "id"> {
    user_id: number;
    post_id: number;
}

type UserReferenceCreationAttribute = Optional<UserReferenceAttributes, "createdAt" | "updatedAt">;

/**
 * UserReferences instance object interface
 */
export interface UserReferenceInstance extends Sequelize.Model<UserReferenceAttributes, UserReferenceCreationAttribute>, UserReferenceAttributes {}

/**
 *  Build UserReferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function UserReferenceModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserReferenceInstance> {
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
  const UserReference = sequelize.define<UserReferenceInstance, UserReferenceCreationAttribute>("UserReference", attributes, { underscored: true, tableName: TABLE_NAME });

  return UserReference;
}
