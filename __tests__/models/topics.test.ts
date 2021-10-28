import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Topics model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Topics, Thread, UserGroup } = db.getModels();

    await Topics.destroy({ truncate: true });
    await Thread.destroy({ truncate: true });
    await UserGroup.destroy({ truncate: true });
  });

  it("should create a new topic with just a title", async () => {
    const { Topics } = db.getModels();

    const topic = await Topics.build({
      title: "test"
    }).save();

    expect(topic.title).toEqual("test");

    expect(topic.id).toBeDefined();
    expect(topic.createdAt).toBeDefined();
    expect(topic.updatedAt).toBeDefined();

    expect(topic.createdAt).toEqual(topic.updatedAt);
  });

  it("should allow multiple topics with the same title", async () => {
    const { Topics } = db.getModels();

    const topic1 = await Topics.create({
      title: "test"
    });

    expect(topic1).toBeDefined();
    expect(topic1.title).toEqual("test");

    const topic2 = await Topics.create({
      title: "test"
    });

    expect(topic2).toBeDefined();
    expect(topic2.title).toEqual("test");
  });

  it("should not have any threads initially", async () => {
    const { Topics } = db.getModels();

    const topic = await Topics.create({
      title: "test"
    });

    expect(await topic.countThreads()).toEqual(0);
    expect(await topic.getThreads()).toEqual([]);
  });

  it("should associate a thread with a topic", async () => {
    const { Topics, Thread } = db.getModels();

    const topic = await Topics.create({
      title: "test"
    });

    const thread = await Thread.create({
      th_title: "a thread"
    });

    expect(await topic.countThreads()).toEqual(0);
    expect(await topic.getThreads()).toEqual([]);

    await thread.setTopic(topic);

    expect(await topic.countThreads()).toEqual(1);
    expect(await topic.hasThread(thread)).toBeTruthy();
  });

  it("should be able to associate a topic to a group", async () => {
    const { UserGroup, Topics } = db.getModels();

    const group = await UserGroup.create({
      name: "test"
    });

    const topic = await Topics.create({
      title: "a topic"
    });

    expect(await topic.getUserGroup()).toBeNull();

    topic.setUserGroup(group);
    const associatedGroup = await topic.getUserGroup();

    expect(associatedGroup).not.toBeNull();
    expect(associatedGroup.name).toEqual("test");
  });
});
