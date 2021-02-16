import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Preferences tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { Preferences } = db.getModels();
    await Preferences.create({ language: "en" });
  });

  beforeEach(async () => {
    const { Preferences, Users } = db.getModels();

    await Preferences.destroy({ truncate: true });
    await Users.destroy({ truncate: true });
  });

  it("should create new preferences", async () => {
    const { Preferences } = db.getModels();

    const preferences = await Preferences.create({ language: "es" });
    const preferencesSaved = await Preferences.findOne({ where: { language: "es" }});

    expect(preferencesSaved).toBeDefined();
    expect(preferences.id).toEqual(preferencesSaved!.id);
  });

  it("should assing preferences to user", async () => {
    const { Preferences, Users } = db.getModels();
    const preferences = await Preferences.findOne({ where: { language: "en" }});
    const user = await Users.create({ username: "user" });

    expect(await user.getPreferences()).toBeNull();
    await user.setPreferences(preferences!);
    expect(await user.getPreferences()).toBeDefined();
  });

});
