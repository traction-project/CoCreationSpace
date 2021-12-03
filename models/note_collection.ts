import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4} from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface NoteCollectionAttributes extends CommonAttributes {
  name: string;
  description?: string;
}


type NoteCollectionCreationAttributes = Optional<NoteCollectionAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * NoteCollection instance object interface
 */
export interface NoteCollectionInstance extends Sequelize.Model<NoteCollectionAttributes, NoteCollectionCreationAttributes>, NoteCollectionAttributes {
}

/**
 *  Build NoteCollection Model object
 * @param sequelize Sequelize: Connection object
 */
export function NoteCollectionModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<NoteCollectionInstance> {
  //  DB table name
  const TABLE_NAME = "note_collections";

  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    name: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.DataTypes.TEXT
    }
  };

  // Create the model
  const NoteCollection = sequelize.define<NoteCollectionInstance, NoteCollectionCreationAttributes>("noteCollection", attributes, { underscored: true, tableName: TABLE_NAME });
  NoteCollection.beforeCreate(noteCollection => { noteCollection.id = uuidv4(); });

  return NoteCollection;
}
