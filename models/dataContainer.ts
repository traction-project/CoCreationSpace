import * as Sequelize from "sequelize";

import { commonAttributes } from "util/typing/modelCommonAttributes";
import { PostAttributes, PostInstance } from "./post";
import { MultimediaAttributes, MultimediaInstance } from "./multimedia";

export interface DataContainerAttributes extends commonAttributes{
    text_content?: string;
    post?: PostAttributes | PostAttributes["id"];
    multimedia?: MultimediaAttributes[] | MultimediaAttributes["id"][];
}

/**
 * DataContainer instance object interface
 */
export interface DataContainerInstance extends Sequelize.Model<DataContainerAttributes>, DataContainerAttributes {
  getPost: Sequelize.BelongsToGetAssociationMixin<PostInstance>;
  setPost: Sequelize.BelongsToSetAssociationMixin<PostInstance, PostInstance["id"]>;
  createPost: Sequelize.BelongsToCreateAssociationMixin<PostAttributes>;

  getMultimedia: Sequelize.HasManyGetAssociationsMixin<MultimediaInstance>;
  setMultimedia: Sequelize.HasManySetAssociationsMixin<MultimediaInstance, MultimediaInstance["id"]>;
  addMultimedias: Sequelize.HasManyAddAssociationsMixin<MultimediaInstance, MultimediaInstance["id"]>;
  addMultimedia: Sequelize.HasManyAddAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
  createMultimedia: Sequelize.HasManyCreateAssociationMixin<MultimediaInstance>;
  removeMultimedia: Sequelize.HasManyRemoveAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
  removeMultimedias: Sequelize.HasManyRemoveAssociationsMixin<MultimediaInstance, MultimediaInstance["id"]>;
  hasMultimedia: Sequelize.HasManyHasAssociationMixin<MultimediaInstance, MultimediaInstance["id"]>;
  hasMultimedias: Sequelize.HasManyHasAssociationsMixin<MultimediaInstance, MultimediaInstance["id"]>;
  countMultimedias: Sequelize.HasManyCountAssociationsMixin;
}

/**
 *  Build DataContainers Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function DataContainerModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<DataContainerInstance> {
  // Model attributtes
  const attributes = {
    text_content: {
      type: Sequelize.DataTypes.STRING
    }
  };
  
  // Create the model
  const DataContainer = sequelize.define<DataContainerInstance>("DataContainer", attributes, { underscored: true, tableName: "data_container" });

  return DataContainer;
}
