import Sequelize from "sequelize";
import uuid from "uuid";

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
    language: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  };

  // Create the model
  const Preferences = sequelize.define<PreferencesInstance>("preferences", attributes, { underscored: true, tableName: TABLE_NAME });

  Preferences.beforeCreate(preference => { preference.id = uuid.v4(); });

  return Preferences;
}
