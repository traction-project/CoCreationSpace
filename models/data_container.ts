import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { PostAttributes, PostInstance } from "./post";
import { MultimediaAttributes, MultimediaInstance } from "./multimedia";

export interface DataContainerAttributes extends CommonAttributes{
    text_content?: string;
    post?: PostAttributes | PostAttributes["id"];
    multimedia?: MultimediaAttributes[] | MultimediaAttributes["id"][];
}

type DataContainerCreationAttributes = Optional<DataContainerAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * DataContainer instance object interface
 */
export interface DataContainerInstance extends Sequelize.Model<DataContainerAttributes, DataContainerCreationAttributes>, DataContainerAttributes {
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
  // DB table name
  const TABLE_NAME = "data_container";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    text_content: {
      type: Sequelize.DataTypes.STRING
    }
  };

  // Create the model
  const DataContainer = sequelize.define<DataContainerInstance, DataContainerCreationAttributes>("DataContainer", attributes, { underscored: true, tableName: TABLE_NAME });

  DataContainer.beforeCreate(dataContainer => { dataContainer.id = uuidv4(); });

  return DataContainer;
}
