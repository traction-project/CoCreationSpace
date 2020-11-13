import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Permissions model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Permissions } = db.getModels();
    await Permissions.destroy({ truncate: true });
  });

  it("should retrieve a series of permissions by type", async () => {
    const { Permissions } = db.getModels();

    Permissions.create({ type: "permission1" });
    Permissions.create({ type: "permission2" });
    Permissions.create({ type: "permission3" });

    expect(await Permissions.count()).toEqual(3);

    const result = await Permissions.findAll({
      where: { type: ["permission1", "permission2"] }
    });

    expect(result.length).toEqual(2);
    expect(result[0].type).toEqual("permission1");
    expect(result[1].type).toEqual("permission2");
  });
});
