import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("InternalNavigationStep model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { InternalNavigationStep } = db.getModels();
    await InternalNavigationStep.destroy({ truncate: true });
  });

  it("should create a new empty instance", async () => {
    const { InternalNavigationStep } = db.getModels();

    const query = await InternalNavigationStep.create({});

    expect(query).toBeDefined();

    expect(query.id).toBeDefined();
    expect(query.createdAt).toBeDefined();
    expect(query.updatedAt).toBeDefined();

    expect(query.data).toBeUndefined();
    expect(query.user).toBeUndefined();

    expect(query.createdAt).toEqual(query.updatedAt);
  });

  it("should create a new instance with data", async () => {
    const { InternalNavigationStep } = db.getModels();

    const query = await InternalNavigationStep.create({
      data: { message: "Hello World" }
    });

    expect(query).toBeDefined();

    expect(query.id).toBeDefined();
    expect(query.createdAt).toBeDefined();
    expect(query.updatedAt).toBeDefined();

    expect(query.user).toBeUndefined();

    expect(query.createdAt).toEqual(query.updatedAt);
    expect(query.data).toEqual({ message: "Hello World" });
  });

  it("should associate a new instance to a user", async () => {
    const { InternalNavigationStep, Users } = db.getModels();

    const query = await InternalNavigationStep.create({
      data: {}
    });

    const user = await Users.create({
      username: "admin"
    });

    expect(await query.getUser()).toBeNull();
    expect(await user.countInternalNavigationSteps()).toEqual(0);

    await query.setUser(user);

    expect(await query.getUser()).toBeDefined();
    expect(await user.countInternalNavigationSteps()).toEqual(1);
  });
});
