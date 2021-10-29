import { UserAttributes } from "models/user";
import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Notifications model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { User } = db.getModels();
    await User.create({
      username: "admin"
    });
  });

  beforeEach(async () => {
    const { Notification } = db.getModels();
    await Notification.destroy({ truncate: true });
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

    const user = await User.findOne({ where: { username: "admin" }});
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

    const user = await User.findOne({ where: { username: "admin" }});
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

    const user = (await User.findOne({ where: { username: "admin" }}))!;
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
    const user = (await User.findOne({ where: { username: "admin" }}))!;

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

    const user = (await User.findOne({ where: { username: "admin" }}))!;
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
});
