import * as Sequelize from "sequelize";

import { commonAttributes } from "typings/modelCommonAttributes";

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
  // Model attributtes
  const attributes = {
    language: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  };
  
  // Create the model
  const Preferences = sequelize.define<PreferencesInstance>("preferences", attributes, { underscored: true, tableName: "preferences" });

  return Preferences;
}
