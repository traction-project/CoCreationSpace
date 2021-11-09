import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("SearchQuery model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { SearchQuery } = db.getModels();
    await SearchQuery.destroy({ truncate: true });
  });

  it("should create a new instance", async () => {
    const { SearchQuery } = db.getModels();

    const query = await SearchQuery.create({
      query: "test"
    });

    expect(query).toBeDefined();

    expect(query.id).toBeDefined();
    expect(query.createdAt).toBeDefined();
    expect(query.updatedAt).toBeDefined();

    expect(query.resultcount).toBeUndefined();
    expect(query.user).toBeUndefined();

    expect(query.query).toEqual("test");
  });

  it("should create a new instance with result count", async () => {
    const { SearchQuery } = db.getModels();

    const query = await SearchQuery.create({
      query: "test",
      resultcount: 10
    });

    expect(query).toBeDefined();

    expect(query.id).toBeDefined();
    expect(query.createdAt).toBeDefined();
    expect(query.updatedAt).toBeDefined();
    expect(query.resultcount).toEqual(10);

    expect(query.user).not.toBeDefined();

    expect(query.createdAt).toEqual(query.updatedAt);
    expect(query.query).toEqual("test");
  });

  it("should associate a new instance to a user", async () => {
    const { SearchQuery, User } = db.getModels();

    const query = await SearchQuery.create({
      query: "test"
    });

    const user = await User.create({
      username: "admin"
    });

    expect(await query.getUser()).toBeNull();

    await query.setUser(user);
    expect(await query.getUser()).toBeDefined();
  });
});
