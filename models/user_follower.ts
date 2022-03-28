import Sequelize from "sequelize";

export interface UserFollowerAttributes {
}

/**
 * UserFollower instance object interface
 */
export interface UserFollowerInstance extends Sequelize.Model<UserFollowerAttributes>, UserFollowerAttributes {
}

/**
 * Build UserFollower model object
 *
 * @param sequelize Sequelize: Database connection object
 */
export function UserFollowerModelFactory(sequelize: Sequelize.Sequelize): Sequelize.ModelCtor<UserFollowerInstance> {
  //  DB table name
  const TABLE_NAME = "user_followers";

  // Model attributtes
  const attributes = {};

  // Create the model
  const UserFollower = sequelize.define<UserFollowerInstance>("userFollower", attributes, { underscored: true, tableName: TABLE_NAME });

  return UserFollower;
}
