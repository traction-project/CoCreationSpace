import { Sequelize } from "sequelize";

import { UserAttributes } from "models/user";
import { getAllMethods, generateBelongsToAssociationMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Notifications model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Notification, User } = db.getModels();

    await Notification.destroy({ truncate: true });
    await User.destroy({ truncate: true });
  });

  it("should create an empty notification", async () => {
    const { Notification } = db.getModels();

    const notification = await Notification.build({
      data: { text: "Hello World" }
    }).save();

    expect(notification).toBeDefined();
    expect(notification.data).toEqual({ text: "Hello World" });
    expect(notification.user).toBeUndefined();
  });

  it("should create a notification with the field 'seen' initialised to false", async () => {
    const { Notification } = db.getModels();

    const notification = await Notification.build({
      data: { text: "Hello World" }
    }).save();

    expect(notification).toBeDefined();
    expect(notification.seen).toBeFalsy();
  });

  it("should create a notification an associate it to a user", async () => {
    const { Notification, User } = db.getModels();

    const user = await User.create({ username: "admin" });
    const notification = await Notification.build({
      data: { text: "Hello World" }
    }).save();

    await notification.setUser(user!);

    const newNotification = await Notification.findOne({ include: ["user"] });

    expect(newNotification).toBeDefined();
    expect(newNotification!.user).toBeDefined();
  });

  it("should create a notification and retrieve the user through the getUser method", async () => {
    const { Notification, User } = db.getModels();

    const user = await User.create({ username: "admin" });
    const notification = await Notification.build({
      data: { text: "Hello World" }
    }).save();

    await notification.setUser(user!);
    const notificationUser = await notification.getUser();

    expect(notificationUser).toBeDefined();
    expect(notificationUser.username).toEqual("admin");
  });

  it("should create a notification and set the user through user id", async () => {
    const { Notification, User } = db.getModels();

    const user = await User.create({ username: "admin" });
    const notification = await Notification.build({
      data: { text: "Hello World" }
    }).save();

    await notification.setUser(user.id);
    const notificationUser = await notification.getUser();

    expect(notificationUser).toBeDefined();
    expect(notificationUser.username).toEqual("admin");
    expect(notificationUser.id).toEqual(user.id);
  });

  it("should allow to query all notifications from an user instance", async () => {
    const { Notification, User } = db.getModels();
    const user = await User.create({ username: "admin" });

    let notification = await Notification.build({
      data: { text: "Hello World" }
    }).save();
    await notification.setUser(user);

    notification = await Notification.build({
      data: { text: "Hello Space" }
    }).save();
    await notification.setUser(user);

    expect(await user.countNotifications()).toEqual(2);

    const userNotifications = await user.getNotifications();
    expect(userNotifications.length).toEqual(2);

    expect(userNotifications[0].data).toEqual({ text: "Hello World" });
    expect(userNotifications[1].data).toEqual({ text: "Hello Space" });
  });

  it("should allow user IDs in where statements", async () => {
    const { Notification, User } = db.getModels();

    const user = await User.create({ username: "admin" });
    const notification = await Notification.build({
      data: { text: "Hello World" }
    }).save();

    await notification.setUser(user.id);

    const savedNotification = await Notification.findOne({
      where: {
        data: { text: "Hello World" }
      },
      include: {
        model: User,
        where: { id: user.id }
      }
    });

    expect(savedNotification).not.toBeNull();

    const savedUser = savedNotification!.user! as UserAttributes;
    expect(savedUser.username).toEqual("admin");
  });

  it("should soft-delete a notification", async () => {
    const { Notification } = db.getModels();

    const notification = await Notification.build({
      data: { text: "Hello World" }
    }).save();

    expect(notification).toBeDefined();
    expect(notification.seen).toBeFalsy();
    expect(notification.isSoftDeleted()).toBeFalsy();
    expect(await Notification.count()).toEqual(1);

    await notification.destroy();

    expect(notification.isSoftDeleted()).toBeTruthy();
    expect(await Notification.count()).toEqual(0);

    await notification.restore();

    expect(notification.isSoftDeleted()).toBeFalsy();
    expect(await Notification.count()).toEqual(1);
  });

  it("should have automatically generated association methods for the User model", async () => {
    const { Notification } = db.getModels();
    const notification = await Notification.create({ data: {} });

    const expectedMethods = generateBelongsToAssociationMethods("User");
    const availableMethods = getAllMethods(notification);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should create a notification with user ID", async () => {
    const { Notification, User } = db.getModels();
    const user = await User.create({ username: "admin" });

    const notification = await Notification.create({
      data: { title: "some notification" },
      userId: user.id,
      hash: "some_hash"
    });

    const notificationUser = await notification.getUser();

    expect(notificationUser).not.toBeNull();
    expect(notificationUser.id).toEqual(user.id);
    expect(notificationUser.username).toEqual("admin");
  });

  it("should retrieve all notifications for a user which were not seen yet", async () => {
    const { Notification, User } = db.getModels();

    const user = await User.create({ username: "admin" });
    const otherUser = await User.create({ username: "test" });

    await Notification.create({ data: {}, hash: "some_hash", userId: user.id });
    await Notification.create({ data: {}, hash: "some_hash", userId: user.id });
    await Notification.create({ data: {}, hash: "some_hash", userId: user.id, seen: true });
    await Notification.create({ data: {}, hash: "some_hash", userId: otherUser.id, seen: true });
    await Notification.create({ data: {}, hash: "some_hash", userId: otherUser.id });

    const notificationsUser = await Notification.findAll({
      where: {
        userId: user.id,
        seen: false
      }
    });

    expect(notificationsUser.length).toEqual(2);

    const notificationsOther = await Notification.findAll({
      where: {
        userId: otherUser.id,
        seen: false
      }
    });

    expect(notificationsOther.length).toEqual(1);
  });

  it("should retrieve all notifications for a user", async () => {
    const { Notification, User } = db.getModels();

    const user = await User.create({ username: "admin" });
    const otherUser = await User.create({ username: "test" });

    await Notification.create({ data: {}, hash: "some_hash", userId: user.id });
    await Notification.create({ data: {}, hash: "some_hash", userId: user.id });
    await Notification.create({ data: {}, hash: "some_hash", userId: user.id, seen: true });
    await Notification.create({ data: {}, hash: "some_hash", userId: otherUser.id, seen: true });
    await Notification.create({ data: {}, hash: "some_hash", userId: otherUser.id });

    const notificationsUser = await Notification.findAll({
      where: { userId: user.id }
    });

    expect(notificationsUser.length).toEqual(3);

    const notificationsOther = await Notification.findAll({
      where: { userId: otherUser.id }
    });

    expect(notificationsOther.length).toEqual(2);
  });
});
