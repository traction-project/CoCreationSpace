import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface UserReferenceAttributes extends Omit<CommonAttributes, "id"> {
  userId: number;
  postId: number;
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
    userId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    },
    postId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    }
  };

  // Create the model
  const UserReference = sequelize.define<UserReferenceInstance, UserReferenceCreationAttribute>("userReference", attributes, { underscored: true, tableName: TABLE_NAME });

  return UserReference;
}
