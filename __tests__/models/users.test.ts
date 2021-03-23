import { Sequelize } from "sequelize";
import jwt from "jsonwebtoken";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";
import { UserInstance } from "models/users";

describe("Users model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Users, UserGroup, Permissions } = db.getModels();

    await Users.destroy({ truncate: true });
    await Permissions.destroy({ truncate: true });
    await UserGroup.destroy({ truncate: true });
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

  it("should not fail when trying to remove an interest that the user does not have", async () => {
    const { Users, Topics } = db.getModels();

    const user = await Users.create({ username: "admin" });

    const topic1 = await Topics.create({ title: "topic1" });
    const topic2 = await Topics.create({ title: "topic2" });
    const topic3 = await Topics.create({ title: "topic3" });

    await user.addInterestedTopics([topic1, topic2]);
    expect(await user.countInterestedTopics()).toEqual(2);

    await user.removeInterestedTopic(topic3);
    expect(await user.countInterestedTopics()).toEqual(2);

    await user.removeInterestedTopic(topic2);
    expect(await user.countInterestedTopics()).toEqual(1);
  });

  it("should take authorization object with token from user registered", async () => {
    const { Users } = db.getModels();

    const user = await Users.create(
      {
        username: "admin",
        password: "password"
      }
    );
    const token = user.generateToken(60);

    const authObject = user.getAuth();
    expect(authObject.username).toBeDefined();
    expect(authObject.username).toEqual(user.username);
    expect(authObject.token).toBeDefined();
    expect(authObject.token).toEqual(token);
  });

  it("should generate a valid token from user registered", async () => {
    const { Users } = db.getModels();

    const user = await Users.create(
      {
        username: "admin",
        password: "password"
      }
    );
    const token = user.generateToken(60);
    const decoded = (await jwt.verify(token, "sessionsecret")) as UserInstance;
    expect(decoded).toBeDefined();
    expect(decoded.id).toEqual(user.id);
  });

  it("should associate a user with a single group", async () => {
    const { Users, UserGroup } = db.getModels();

    const user = await Users.create(
      {
        username: "admin",
        password: "password"
      }
    );
    const group = await UserGroup.create({ name: "group1" });

    expect(await user.countUserGroups()).toEqual(0);

    await user.addUserGroup(group);
    expect(await user.countUserGroups()).toEqual(1);
  });

  it("should associate a user with multiple single groups", async () => {
    const { Users, UserGroup } = db.getModels();

    const user = await Users.create(
      {
        username: "admin",
        password: "password"
      }
    );
    const group1 = await UserGroup.create({ name: "group1" });
    const group2 = await UserGroup.create({ name: "group2" });

    expect(await user.countUserGroups()).toEqual(0);

    await user.addUserGroups([group1, group2]);
    expect(await user.countUserGroups()).toEqual(2);
  });

  it("should remove a user from a group", async () => {
    const { Users, UserGroup } = db.getModels();

    const user = await Users.create(
      {
        username: "admin",
        password: "password"
      }
    );
    const group1 = await UserGroup.create({ name: "group1" });
    const group2 = await UserGroup.create({ name: "group2" });
    await user.addUserGroups([group1, group2]);

    expect(await user.countUserGroups()).toEqual(2);
    await user.removeUserGroup(group1.id);
    expect(await user.countUserGroups()).toEqual(1);
  });

  it("should return whether a user is part of a group", async () => {
    const { Users, UserGroup } = db.getModels();

    const user = await Users.create(
      {
        username: "admin",
        password: "password"
      }
    );
    const group1 = await UserGroup.create({ name: "group1" });

    expect(await user.hasUserGroup(group1)).toBeFalsy();
    await user.addUserGroup(group1);
    expect(await user.hasUserGroup(group1)).toBeTruthy();
  });

  it("should list a user's multimedia interactions", async () => {
    const { Users, MultimediaInteraction } = db.getModels();

    const user = await Users.create({
      username: "admin",
      password: "password",
    });

    expect(await user.countMultimediaInteractions()).toEqual(0);

    const interaction = await MultimediaInteraction.create({
      interaction: { type: "play", timestamp: 1 }
    });

    await interaction.setUser(user);

    expect(await user.countMultimediaInteractions()).toEqual(1);
    expect(await user.hasMultimediaInteraction(interaction)).toBeTruthy();
  });

  it("should list a user's search queries", async () => {
    const { Users, SearchQuery } = db.getModels();

    const user = await Users.create({
      username: "admin",
      password: "password",
    });

    expect(await user.countSearchQueries()).toEqual(0);

    const query = await SearchQuery.create({
      query: "hello world"
    });

    await query.setUser(user);

    expect(await user.countSearchQueries()).toEqual(1);
    expect(await user.hasSearchQuery(query)).toBeTruthy();
    expect(await user.hasSearchQueries([query])).toBeTruthy();

    await user.removeSearchQueries([query]);
    expect(await user.countSearchQueries()).toEqual(0);
  });

  it("should initialise a new object with empty email address", async () => {
    const { Users } = db.getModels();

    const user = await Users.create({
      username: "admin",
    });

    expect(user.email).toBeUndefined();
  });

  it("should initialise a new object with given email address", async () => {
    const { Users } = db.getModels();

    const user = await Users.create({
      username: "admin",
      email: "admin@test.com"
    });

    expect(user.email).toEqual("admin@test.com");
  });

  it("should make sure that email addresses are unique", async () => {
    const { Users } = db.getModels();

    const user1 = await Users.create({
      username: "admin",
      email: "admin@test.com"
    });

    expect(user1.email).toEqual("admin@test.com");

    try {
      await Users.create({
        username: "admin2",
        email: "admin@test.com"
      });

      fail();
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.fields.length).toEqual(1);
      expect(e.fields[0]).toEqual("email");
    }
  });

  it("should initialise a new object with a participant code", async () => {
    const { Users } = db.getModels();

    const user = await Users.create({
      username: "admin",
      participantCode: "participant1"
    });

    expect(user.participantCode).toEqual("participant1");
  });
});
