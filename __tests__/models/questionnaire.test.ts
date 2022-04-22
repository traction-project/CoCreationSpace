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
    const { Questionnaire } = db.getModels();

    await Questionnaire.destroy({ truncate: true });
  });

  it("should create a basic Questionnaire entry", async () => {
    const { Questionnaire } = db.getModels();

    const chapter = await Questionnaire.create({
      name: "Questionnaire 1",
      data: { question1: "Hello World" }
    });

    expect(chapter.name).toEqual("Questionnaire 1");
    expect(chapter.data).toEqual({ question1: "Hello World"});

    expect(await Questionnaire.count()).toEqual(1);
  });

  it("should have automatically generated association methods for the User model", async () => {
    const { Questionnaire } = db.getModels();
    const videoChapter = await Questionnaire.create({ name: "test", data: {} });

    const expectedMethods = generateHasManyAssociationMethods("User");
    const availableMethods = getAllMethods(videoChapter);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
