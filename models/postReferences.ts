import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";

export interface PostReferencesAttributes extends commonAttributes{
    post_references_id: number;
    post_referenced_id: number;
}

/**
 * PostReferences instance object interface
 */
export interface PostReferencesInstance extends Sequelize.Model<PostReferencesAttributes>, PostReferencesAttributes {}

/**
 *  Build PostReferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function PostReferencesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PostReferencesInstance> {
  // Model attributtes
  const attributes = {
    post_references_id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    post_referenced_id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    }
  };
  
  // Create the model
  const PostReferences = sequelize.define<PostReferencesInstance>("postReferences", attributes, { underscored: true, tableName: "post_references" });

  return PostReferences;
}
