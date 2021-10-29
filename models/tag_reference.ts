import Sequelize, { Optional } from "sequelize";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface TagReferenceAttributes extends Omit<CommonAttributes, "id"> {
    tag_id: number;
    post_id: number;
}

type TagReferenceCreationAttributes = Optional<TagReferenceAttributes, "createdAt" | "updatedAt">;

/**
 * TagReferences instance object interface
 */
export interface TagReferenceInstance extends Sequelize.Model<TagReferenceAttributes, TagReferenceCreationAttributes>, TagReferenceAttributes {}

/**
 *  Build TagReferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function TagReferenceModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<TagReferenceInstance> {
  //  DB table name
  const TABLE_NAME = "tag_references";
  // Model attributtes
  const attributes = {
    tag_id: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    },
    post_id: {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    }
  };

  // Create the model
  const TagReference = sequelize.define<TagReferenceInstance, TagReferenceCreationAttributes>("tagReference", attributes, { underscored: true, tableName: TABLE_NAME });

  return TagReference;
}
