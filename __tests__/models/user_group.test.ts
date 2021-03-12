import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("UserGroup model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Users, UserGroup, Topics } = db.getModels();

    await UserGroup.destroy({ truncate: true });
    await Users.destroy({ truncate: true });
    await Topics.destroy({ truncate: true });
  });

  it("should create a new group with just a name", async () => {
    const { UserGroup } = db.getModels();

    const group = await UserGroup.build({
      name: "test"
    }).save();

    expect(group.name).toEqual("test");

    expect(group.id).toBeDefined();
    expect(group.createdAt).toBeDefined();
    expect(group.updatedAt).toBeDefined();

    expect(group.createdAt).toEqual(group.updatedAt);
  });

  it("should not create a record with empty name", async () => {
    const { UserGroup } = db.getModels();

    try {
      await UserGroup.build({ name: "" }).save();
      fail();
    } catch (e) {
      expect(e).toBeDefined();
    }
  });

  it("should ensure that group names are unique", async () => {
    const { UserGroup } = db.getModels();

    await UserGroup.build({ name: "group1" }).save();
    expect(await UserGroup.count()).toEqual(1);

    try {
      await UserGroup.build({ name: "group1" }).save();
      fail();
    } catch (e) {
      expect(e).toBeDefined();
      expect(await UserGroup.count()).toEqual(1);
    }
  });

  it("should create a new group with no users", async () => {
    const { UserGroup } = db.getModels();

    const user = await UserGroup.build({
      name: "test"
    }).save();

    expect(await user.countUsers()).toEqual(0);
  });

  it("should add users to a group", async () => {
    const { Users, UserGroup } = db.getModels();

    const group = await UserGroup.build({
      name: "test"
    }).save();

    const user1 = await Users.create({ username: "user1" });
    const user2 = await Users.create({ username: "user2" });

    expect(await group.countUsers()).toEqual(0);

    await group.addUser(user1);
    expect(await group.countUsers()).toEqual(1);

    await group.addUser(user2);
    expect(await group.countUsers()).toEqual(2);
  });

  it("should not add users to a group multiple times", async () => {
    const { Users, UserGroup } = db.getModels();

    const group = await UserGroup.build({
      name: "test"
    }).save();

    const user1 = await Users.create({ username: "user1" });
    expect(await group.countUsers()).toEqual(0);

    await group.addUser(user1);
    expect(await group.countUsers()).toEqual(1);

    await group.addUser(user1);
    expect(await group.countUsers()).toEqual(1);
  });

  it("should remove users from a group", async () => {
    const { Users, UserGroup } = db.getModels();

    const group = await UserGroup.build({
      name: "test"
    }).save();

    const user1 = await Users.create({ username: "user1" });
    const user2 = await Users.create({ username: "user2" });

    await group.addUsers([user1, user2]);
    expect(await group.countUsers()).toEqual(2);

    await group.removeUser(user1);
    expect(await group.countUsers()).toEqual(1);
    expect((await group.getUsers())[0].username).toEqual(user2.username);
  });

  it("should not have any topics initially", async () => {
    const { UserGroup } = db.getModels();

    const group = await UserGroup.create({
      name: "test"
    });

    expect(await group.countTopics()).toEqual(0);
    expect(await group.getTopics()).toEqual([]);
  });

  it("should be able to associate a topic to a group", async () => {
    const { UserGroup, Topics } = db.getModels();

    const group = await UserGroup.create({
      name: "test"
    });

    const topic = await Topics.create({
      title: "a topic"
    });

    expect(await group.countTopics()).toEqual(0);
    expect(await group.getTopics()).toEqual([]);

    await group.addTopic(topic);

    expect(await group.countTopics()).toEqual(1);
    expect(await group.hasTopic(topic)).toBeTruthy();
  });
});
