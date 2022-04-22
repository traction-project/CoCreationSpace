import { Sequelize } from "sequelize";
import { generateHasManyAssociationMethods, getAllMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Questionnaire model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Questionnaire, User } = db.getModels();

    await Questionnaire.destroy({ truncate: true });
    await User.destroy({ truncate: true });
  });

  it("should create a basic Questionnaire entry", async () => {
    const { Questionnaire } = db.getModels();

    const questionnaire = await Questionnaire.create({
      name: "Questionnaire 1",
      data: { question1: "Hello World" }
    });

    expect(questionnaire.name).toEqual("Questionnaire 1");
    expect(questionnaire.data).toEqual({ question1: "Hello World"});

    expect(await Questionnaire.count()).toEqual(1);
  });

  it("should be possible to associate a questionnaire to a user", async () => {
    const { Questionnaire, User } = db.getModels();

    const questionnaire = await Questionnaire.create({
      name: "Questionnaire 1",
      data: { question1: "Hello World" }
    });

    const user = await User.create({
      username: "test"
    });

    expect(await questionnaire.countUsers()).toEqual(0);
    await questionnaire.addUser(user);

    expect(await questionnaire.countUsers()).toEqual(1);
    expect((await questionnaire.getUsers())[0].username).toEqual("test");
  });

  it("should have automatically generated association methods for the User model", async () => {
    const { Questionnaire } = db.getModels();
    const questionnaire = await Questionnaire.create({ name: "test", data: {} });

    const expectedMethods = generateHasManyAssociationMethods("User");
    const availableMethods = getAllMethods(questionnaire);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
