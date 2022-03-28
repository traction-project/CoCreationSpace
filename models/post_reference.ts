import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface PostReferenceAttributes extends Omit<CommonAttributes, "id"> {
  postReferencesId: number;
  postReferencedId: number;
}

type PostReferenceCreationAttributes = Optional<PostReferenceAttributes, "createdAt" | "updatedAt">

/**
 * PostReferences instance object interface
 */
export interface PostReferenceInstance extends Sequelize.Model<PostReferenceAttributes, PostReferenceCreationAttributes>, PostReferenceAttributes {}

/**
 *  Build PostReferencess Model object
 * @param sequelize Sequelize: Database connection object
 */
export function PostReferenceModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PostReferenceInstance> {
  //  DB table name
  const TABLE_NAME = "post_references";
  // Model attributtes
  const attributes = {
    postReferencesId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    },
    postReferencedId: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    }
  };

  // Create the model
  const PostReference = sequelize.define<PostReferenceInstance, PostReferenceCreationAttributes>("postReference", attributes, { underscored: true, tableName: TABLE_NAME });

  return PostReference;
}
