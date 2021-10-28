import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Permissions model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Permission } = db.getModels();
    await Permission.destroy({ truncate: true });
  });

  it("should retrieve a series of permissions by type", async () => {
    const { Permission } = db.getModels();

    Permission.create({ type: "permission1" });
    Permission.create({ type: "permission2" });
    Permission.create({ type: "permission3" });

    expect(await Permission.count()).toEqual(3);

    const result = await Permission.findAll({
      where: { type: ["permission1", "permission2"] }
    });

    expect(result.length).toEqual(2);
    expect(result[0].type).toEqual("permission1");
    expect(result[1].type).toEqual("permission2");
  });
});
