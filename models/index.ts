import { Sequelize } from "sequelize";

import { DbInterface } from "typings/DbInterface";
import { createAssociations } from "./associations";
import { MultimediaModelFactory } from "./multimedia";
import { UsersModelFactory } from "./users";

/**
 *  Class that contains all models created in the data base. Also, it is charge of
 *  building all models and syncronice with the database.
 */
class DataBase {

  private models: DbInterface; // All models that exists in the DB.

  getModels(): DbInterface {
    return this.models;
  }

  /**
   *  Create all models in the database and return them
   * @param sequelize Sequelize: Conection object with de database
   */
  createModels(sequelize: Sequelize): void {
    const Users = UsersModelFactory(sequelize);
    const Multimedia = MultimediaModelFactory(sequelize);

    this.models = {
      Users,
      Multimedia
    };
  }

  /**
   *  Calls all methods to create the models and them relationships and syncronize it with the database
   * @param sequelize Sequelize: Conection object with de database
   */
  async createDB(sequelize: Sequelize): Promise<DbInterface> {
    // Create the models
    this.createModels(sequelize);

    // Create all relationships between models
    createAssociations(this.models);

    // Syncronice with physical database (If the models not exists in the database, they are created)
    await sequelize.sync();

    return this.models;
  }
}

export const db = new DataBase();

