import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface PostReferencesAttributes extends Omit<CommonAttributes, "id"> {
    post_references_id: number;
    post_referenced_id: number;
}

type PostReferencesCreationAttributes = Optional<PostReferencesAttributes, "createdAt" | "updatedAt">

/**
 * PostReferences instance object interface
 */
export interface PostReferencesInstance extends Sequelize.Model<PostReferencesAttributes, PostReferencesCreationAttributes>, PostReferencesAttributes {}

/**
 *  Build PostReferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function PostReferencesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PostReferencesInstance> {
  //  DB table name
  const TABLE_NAME = "post_references";
  // Model attributtes
  const attributes = {
    post_references_id: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    },
    post_referenced_id: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    }
  };

  // Create the model
  const PostReferences = sequelize.define<PostReferencesInstance, PostReferencesCreationAttributes>("postReferences", attributes, { underscored: true, tableName: TABLE_NAME });

  return PostReferences;
}
