import Sequelize, { Optional } from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { CommonAttributes } from "util/typing/modelCommonAttributes";

export interface PreferenceAttributes extends CommonAttributes{
    language: string;
}

type PreferenceCreationAttributes = Optional<PreferenceAttributes, "id" | "createdAt" | "updatedAt">;

/**
 * Preferences instance object interface
 */
export interface PreferenceInstance extends Sequelize.Model<PreferenceAttributes, PreferenceCreationAttributes>, PreferenceAttributes {}

/**
 *  Build Preferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function PreferenceModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PreferenceInstance> {
  //  DB table name
  const TABLE_NAME = "preferences";
  // Model attributtes
  const attributes = {
    id: {
      type: Sequelize.DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      allowNull: false,
      autoIncrement: false
    },
    language: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  };

  // Create the model
  const Preference = sequelize.define<PreferenceInstance, PreferenceCreationAttributes>("Preference", attributes, { underscored: true, tableName: TABLE_NAME });

  Preference.beforeCreate(preference => { preference.id = uuidv4(); });

  return Preference;
}
