import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Notifications model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { Users } = db.getModels();
    await Users.create({
      username: "admin"
    });
  });

  beforeEach(async () => {
    const { Notifications } = db.getModels();
    await Notifications.destroy({ truncate: true });
  });

  it("should create an empty notification", async () => {
    const { Notifications } = db.getModels();

    const notification = await Notifications.build({
      data: { text: "Hello World" }
    }).save();

    expect(notification).toBeDefined();
    expect(notification.data).toEqual({ text: "Hello World" });
    expect(notification.user).toBeUndefined();
  });

  it("should create a notification with the field 'seen' initialised to false", async () => {
    const { Notifications } = db.getModels();

    const notification = await Notifications.build({
      data: { text: "Hello World" }
    }).save();

    expect(notification).toBeDefined();
    expect(notification.seen).toBeFalsy();
  });

  it("should create a notification an associate it to a user", async () => {
    const { Notifications, Users } = db.getModels();

    const user = await Users.findOne({ where: { username: "admin" }});
    const notification = await Notifications.build({
      data: { text: "Hello World" }
    }).save();

    await notification.setUser(user!);

    const newNotification = await Notifications.findOne({ include: ["user"] });

    expect(newNotification).toBeDefined();
    expect(newNotification!.user).toBeDefined();
  });

  it("should create a notification and retrieve the user through the getUser method", async () => {
    const { Notifications, Users } = db.getModels();

    const user = await Users.findOne({ where: { username: "admin" }});
    const notification = await Notifications.build({
      data: { text: "Hello World" }
    }).save();

    await notification.setUser(user!);
    const notificationUser = await notification.getUser();

    expect(notificationUser).toBeDefined();
    expect(notificationUser.username).toEqual("admin");
  });

  it("should allow to query all notifications from an user instance", async () => {
    const { Notifications, Users } = db.getModels();
    const user = (await Users.findOne({ where: { username: "admin" }}))!;

    let notification = await Notifications.build({
      data: { text: "Hello World" }
    }).save();
    await notification.setUser(user);

    notification = await Notifications.build({
      data: { text: "Hello Space" }
    }).save();
    await notification.setUser(user);

    expect(await user.countNotifications()).toEqual(2);

    const userNotifications = await user.getNotifications();
    expect(userNotifications.length).toEqual(2);

    expect(userNotifications[0].data).toEqual({ text: "Hello World" });
    expect(userNotifications[1].data).toEqual({ text: "Hello Space" });
  });
});
