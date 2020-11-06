import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Users model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Users } = db.getModels();
    await Users.destroy({ truncate: true });
  });

  it("should create a new user with just a username", async () => {
    const { Users } = db.getModels();

    const user = await Users.build({
      username: "test"
    }).save();

    expect(user.username).toEqual("test");

    expect(user.id).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();

    expect(user.createdAt).toEqual(user.updatedAt);
  });

  it("should not create a record with empty username", async () => {
    const { Users } = db.getModels();

    try {
      await Users.build({ username: "" }).save();
      fail();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it("should hash the password when calling setPassword", async () => {
    const { Users } = db.getModels();

    const user = Users.build({ username: "admin" });
    user.setPassword("secret");
    await user.save();

    expect(user.salt).toBeDefined();
    expect(user.password).toBeDefined();

    expect(user.password).not.toEqual("secret");
    expect(user.password!.length).toEqual(1024);
  });

  it("should validate the password when calling validatePassword()", async () => {
    const { Users } = db.getModels();

    const user = Users.build({ username: "admin" });
    user.setPassword("secret");
    await user.save();

    expect(user.validatePassword("wrongpassword")).toBeFalsy();
    expect(user.validatePassword("secret")).toBeTruthy();
  });
});
