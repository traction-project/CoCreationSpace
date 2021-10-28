import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Preferences tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { Preference } = db.getModels();
    await Preference.create({ language: "en" });
  });

  beforeEach(async () => {
    const { Preference, Users } = db.getModels();

    await Preference.destroy({ truncate: true });
    await Users.destroy({ truncate: true });
  });

  it("should create new preferences", async () => {
    const { Preference } = db.getModels();

    const preferences = await Preference.create({ language: "es" });
    const preferencesSaved = await Preference.findOne({ where: { language: "es" }});

    expect(preferencesSaved).toBeDefined();
    expect(preferences.id).toEqual(preferencesSaved!.id);
  });

  it("should assing preferences to user", async () => {
    const { Preference, Users } = db.getModels();
    const preferences = await Preference.findOne({ where: { language: "en" }});
    const user = await Users.create({ username: "user" });

    expect(await user.getPreferences()).toBeNull();
    await user.setPreferences(preferences!);
    expect(await user.getPreferences()).toBeDefined();
  });

});
