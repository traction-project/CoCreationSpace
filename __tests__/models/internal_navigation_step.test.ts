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
    expect(query.userAgent).toBeUndefined();
  });

  it("should create a new instance with data", async () => {
    const { InternalNavigationStep } = db.getModels();
    const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/537.36";

    const query = await InternalNavigationStep.create({
      data: { message: "Hello World" },
      userAgent
    });

    expect(query).toBeDefined();

    expect(query.id).toBeDefined();
    expect(query.createdAt).toBeDefined();
    expect(query.updatedAt).toBeDefined();
    expect(query.userAgent).toBeDefined();

    expect(query.user).toBeUndefined();

    expect(query.data).toEqual({ message: "Hello World" });
    expect(query.userAgent).toEqual(userAgent);
  });

  it("should associate a new instance to a user", async () => {
    const { InternalNavigationStep, User } = db.getModels();

    const query = await InternalNavigationStep.create({
      data: {}
    });

    const user = await User.create({
      username: "admin"
    });

    expect(await query.getUser()).toBeNull();
    expect(await user.countInternalNavigationSteps()).toEqual(0);

    await query.setUser(user);

    expect(await query.getUser()).toBeDefined();
    expect(await user.countInternalNavigationSteps()).toEqual(1);
  });
});
