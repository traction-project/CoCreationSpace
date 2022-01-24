import Sequelize from "sequelize";

export interface FavouriteAttributes {
}

/**
 * Favourite instance object interface
 */
export interface FavouriteInstance extends Sequelize.Model<FavouriteAttributes>, FavouriteAttributes {
}

/**
 * Build Favourite model object
 *
 * @param sequelize Sequelize: Conection object with the database
 */
export function FavouriteModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<FavouriteInstance> {
  //  DB table name
  const TABLE_NAME = "favourites";

  // Model attributtes
  const attributes = {};

  // Create the model
  const Favourite = sequelize.define<FavouriteInstance>("favourite", attributes, { underscored: true, tableName: TABLE_NAME });

  return Favourite;
}
