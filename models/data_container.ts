import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";
import { PostAttributes, PostInstance } from "./post";
import { MediaItemAttributes, MediaItemInstance } from "./media_item";

export interface DataContainerAttributes extends CommonAttributes{
    textContent?: string;
    post?: PostAttributes | PostAttributes["id"];
    mediaItem?: MediaItemAttributes[] | MediaItemAttributes["id"][];
}

type DataContainerCreationAttributes = Optional<DataContainerAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * DataContainer instance object interface
 */
export interface DataContainerInstance extends Sequelize.Model<DataContainerAttributes, DataContainerCreationAttributes>, DataContainerAttributes {
  getPost: Sequelize.BelongsToGetAssociationMixin<PostInstance>;
  setPost: Sequelize.BelongsToSetAssociationMixin<PostInstance, PostInstance["id"]>;
  createPost: Sequelize.BelongsToCreateAssociationMixin<PostAttributes>;

  getMediaItems: Sequelize.HasManyGetAssociationsMixin<MediaItemInstance>;
  countMediaItems: Sequelize.HasManyCountAssociationsMixin;
  hasMediaItem: Sequelize.HasManyHasAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
  hasMediaItems: Sequelize.HasManyHasAssociationsMixin<MediaItemInstance, MediaItemInstance["id"]>;
  setMediaItems: Sequelize.HasManySetAssociationsMixin<MediaItemInstance, MediaItemInstance["id"]>;
  addMediaItem: Sequelize.HasManyAddAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
  addMediaItems: Sequelize.HasManyAddAssociationsMixin<MediaItemInstance, MediaItemInstance["id"]>;
  removeMediaItem: Sequelize.HasManyRemoveAssociationMixin<MediaItemInstance, MediaItemInstance["id"]>;
  removeMediaItems: Sequelize.HasManyRemoveAssociationsMixin<MediaItemInstance, MediaItemInstance["id"]>;
  createMediaItem: Sequelize.HasManyCreateAssociationMixin<MediaItemInstance>;
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
    textContent: {
      type: Sequelize.DataTypes.TEXT
    }
  };

  // Create the model
  const DataContainer = sequelize.define<DataContainerInstance, DataContainerCreationAttributes>("dataContainer", attributes, { underscored: true, tableName: TABLE_NAME });

  DataContainer.beforeCreate(dataContainer => { dataContainer.id = uuidv4(); });

  return DataContainer;
}
