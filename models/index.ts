import { Sequelize } from "sequelize";

import { DbInterface } from "typings/DbInterface";
import { createAssociations } from "./associations";
import { MultimediaModelFactory } from "./multimedia";
import { UsersModelFactory } from "./users";

class DataBase {

  private models: DbInterface;

  getModels(): DbInterface {
    return this.models;
  }

  createModels(sequelize: Sequelize): void {
    const Users = UsersModelFactory(sequelize);
    const Multimedia = MultimediaModelFactory(sequelize);

    this.models = {
      Users,
      Multimedia
    };
  }

  async createDB(sequelize: Sequelize): Promise<DbInterface> {
    this.createModels(sequelize);

    createAssociations(this.models);
    await sequelize.sync();

    return this.models;
  }
}

export const db = new DataBase();

