import { DbInterface } from "typings/DbInterface";

/**
 *  Create all users table relationship with rest of tables
 * @param models DbInterface
 */
function userAssociations(models: DbInterface): void {
  models.Users.hasMany(models.Multimedia, { as: "multimedia", foreignKey: "user_id" });
}

/**
 *  Create all multimedia table relationship with rest of tables
 * @param models DbInterface
 */
function multimediaAssociations(models: DbInterface): void {
  models.Multimedia.belongsTo(models.Users, { as: "user", foreignKey: "user_id" });
}

export function createAssociations(models: DbInterface): void {
  userAssociations(models);  
  multimediaAssociations(models);
}