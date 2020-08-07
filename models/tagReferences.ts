import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";

export interface TagReferencesAttributes extends commonAttributes{
    tag_id: number;
    post_id: number;
}

/**
 * TagReferences instance object interface
 */
export interface TagReferencesInstance extends Sequelize.Model<TagReferencesAttributes>, TagReferencesAttributes {}

/**
 *  Build TagReferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function TagReferencesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<TagReferencesInstance> {
  // Model attributtes
  const attributes = {
    tag_id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    },
    post_id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false
    }
  };
  
  // Create the model
  const TagReferences = sequelize.define<TagReferencesInstance>("tagReferences", attributes, { underscored: true, tableName: "tag_references" });

  return TagReferences;
}
