import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Preferences tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Threads, Topics, Post } = db.getModels();

    await Threads.destroy({ truncate: true });
    await Topics.destroy({ truncate: true });
    await Post.destroy({ truncate: true });
  });

  it("should create new thread", async () => {
    const { Threads } = db.getModels();

    const thread = await Threads.create({ th_title: "thread" });
    const threadSaved = await Threads.findOne({ where: { th_title: "thread" }});

    expect(threadSaved).toBeDefined();
    expect(thread.id).toEqual(threadSaved!.id);
  });

  it("should add thread to a topic", async () => {
    const { Threads, Topics } = db.getModels();
    const thread = await Threads.create({ th_title: "thread" });
    const topic = await Topics.create({ title: "topic" });

    expect(await thread.getTopic()).toBeNull();
    await thread.setTopic(topic);
    expect(await thread.getTopic()).toBeDefined();
    expect(await topic.hasThread(thread)).toBeTruthy();
  });

  it("should remove thread from topic", async () => {
    const { Threads, Topics } = db.getModels();
    const thread = await Threads.create({ th_title: "thread" });
    const topic = await Topics.create({ title: "topic" });

    await thread.setTopic(topic);
    expect(await thread.getTopic()).toBeDefined();
    expect(await topic.hasThread(thread)).toBeTruthy();

    await topic.removeThread(thread);
    expect(await topic.hasThread(thread)).toBeFalsy();
  });

  it("should add post to thread", async () => {
    const { Threads, Post } = db.getModels();
    const thread = await Threads.create({ th_title: "thread" });
    const post1 = await Post.create();
    const post2 = await Post.create();

    expect(await thread.hasPost(post1)).toBeFalsy();
    expect(await thread.countPost()).toEqual(0);

    await thread.addPost(post1);
    await thread.addPost(post2);

    expect(await thread.hasPost(post1)).toBeTruthy();
    expect(await thread.hasPost(post2)).toBeTruthy();
    expect(await thread.countPost()).toEqual(2);
  });

  it("should remove post from thread", async () => {
    const { Threads, Post } = db.getModels();
    const thread = await Threads.create({ th_title: "thread" });
    const post1 = await Post.create();

    await thread.addPost(post1);
    expect(await thread.hasPost(post1)).toBeTruthy();

    await thread.removePost(post1);
    expect(await thread.hasPost(post1)).toBeFalsy();
  });

});
