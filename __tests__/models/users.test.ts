import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Users model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Users, Permissions } = db.getModels();

    await Users.destroy({ truncate: true });
    await Permissions.destroy({ truncate: true });
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

  it("should return true when user has a certain permission", async () => {
    const { Users, Permissions } = db.getModels();

    const user = await Users.create({ username: "admin" });
    const permission = await Permissions.create({ type: "upload_raw" });

    await user.addPermission(permission);
    expect(await user.hasPermission(permission.id)).toBeTruthy();
  });

  it("should count a user's permissions", async () => {
    const { Users, Permissions } = db.getModels();

    const user = await Users.create({ username: "admin" });
    expect(await user.countPermissions()).toEqual(0);

    const permission = await Permissions.create({ type: "some_permission" });
    await user.addPermission(permission);

    expect(await user.countPermissions()).toEqual(1);
  });

  it("should return true when user has a certain series of permissions", async () => {
    const { Users, Permissions } = db.getModels();

    const user = await Users.create({ username: "admin" });

    const permission1 = await Permissions.create({ type: "upload_raw" });
    const permission2 = await Permissions.create({ type: "other_permission" });
    const permission3 = await Permissions.create({ type: "another_permission" });

    await user.addPermissions([permission1, permission2, permission3]);

    expect(await user.countPermissions()).toEqual(3);

    expect(await user.hasPermissions([
      permission1.id, permission2.id, permission3.id
    ])).toBeTruthy();

    expect(await user.hasPermissions([
      permission1, permission2, permission3
    ])).toBeTruthy();
  });

  it("should return false when user is missing a permission in a series", async () => {
    const { Users, Permissions } = db.getModels();

    const user = await Users.create({ username: "admin" });

    const permission1 = await Permissions.create({ type: "upload_raw" });
    const permission2 = await Permissions.create({ type: "other_permission" });
    const permission3 = await Permissions.create({ type: "another_permission" });

    await user.addPermissions([permission1, permission2]);

    expect(await user.countPermissions()).toEqual(2);
    expect(await user.hasPermissions([
      permission1.id, permission2.id, permission3.id
    ])).toBeFalsy();
  });
});
