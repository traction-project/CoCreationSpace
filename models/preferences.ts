import Sequelize from "sequelize";
import { v4 as uuidv4 } from "uuid";

import { commonAttributes } from "util/typing/modelCommonAttributes";

export interface PreferencesAttributes extends commonAttributes{
    language: string;
}

/**
 * Preferences instance object interface
 */
export interface PreferencesInstance extends Sequelize.Model<PreferencesAttributes>, PreferencesAttributes {}

/**
 *  Build Preferencess Model object
 * @param sequelize Sequelize: Conection object with de database
 */
export function PreferencesModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<PreferencesInstance> {
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
  const Preferences = sequelize.define<PreferencesInstance>("preferences", attributes, { underscored: true, tableName: TABLE_NAME });

  Preferences.beforeCreate(preference => { preference.id = uuidv4(); });

  return Preferences;
}
