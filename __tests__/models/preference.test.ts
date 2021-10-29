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
    const { Preference, User } = db.getModels();

    await Preference.destroy({ truncate: true });
    await User.destroy({ truncate: true });
  });

  it("should create new preferences", async () => {
    const { Preference } = db.getModels();

    const preferences = await Preference.create({ language: "es" });
    const preferencesSaved = await Preference.findOne({ where: { language: "es" }});

    expect(preferencesSaved).toBeDefined();
    expect(preferences.id).toEqual(preferencesSaved!.id);
  });

  it("should assing preferences to user", async () => {
    const { Preference, User } = db.getModels();
    const preferences = await Preference.findOne({ where: { language: "en" }});
    const user = await User.create({ username: "user" });

    expect(await user.getPreference()).toBeNull();
    await user.setPreference(preferences!);
    expect(await user.getPreference()).toBeDefined();
  });

});
