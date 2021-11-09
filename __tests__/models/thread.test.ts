import { Sequelize } from "sequelize";
import { getAllMethods, generateHasManyAssociationMethods, generateBelongsToAssociationMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Preferences tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Thread, Topic, Post } = db.getModels();

    await Thread.destroy({ truncate: true });
    await Topic.destroy({ truncate: true });
    await Post.destroy({ truncate: true });
  });

  it("should create new thread", async () => {
    const { Thread } = db.getModels();

    const thread = await Thread.create({ title: "thread" });
    const threadSaved = await Thread.findOne({ where: { title: "thread" }});

    expect(threadSaved).toBeDefined();
    expect(thread.id).toEqual(threadSaved!.id);
  });

  it("should add thread to a topic", async () => {
    const { Thread, Topic } = db.getModels();
    const thread = await Thread.create({ title: "thread" });
    const topic = await Topic.create({ title: "topic" });

    expect(await thread.getTopic()).toBeNull();
    await thread.setTopic(topic);
    expect(await thread.getTopic()).toBeDefined();
    expect(await topic.hasThread(thread)).toBeTruthy();
  });

  it("should remove thread from topic", async () => {
    const { Thread, Topic } = db.getModels();
    const thread = await Thread.create({ title: "thread" });
    const topic = await Topic.create({ title: "topic" });

    await thread.setTopic(topic);
    expect(await thread.getTopic()).toBeDefined();
    expect(await topic.hasThread(thread)).toBeTruthy();

    await topic.removeThread(thread);
    expect(await topic.hasThread(thread)).toBeFalsy();
  });

  it("should add post to thread", async () => {
    const { Thread, Post } = db.getModels();
    const thread = await Thread.create({ title: "thread" });
    const post1 = await Post.create();
    const post2 = await Post.create();

    expect(await thread.hasPost(post1)).toBeFalsy();
    expect(await thread.countPosts()).toEqual(0);

    await thread.addPost(post1);
    await thread.addPost(post2);

    expect(await thread.hasPost(post1)).toBeTruthy();
    expect(await thread.hasPost(post2)).toBeTruthy();
    expect(await thread.countPosts()).toEqual(2);
  });

  it("should remove post from thread", async () => {
    const { Thread, Post } = db.getModels();
    const thread = await Thread.create({ title: "thread" });
    const post1 = await Post.create();

    await thread.addPost(post1);
    expect(await thread.hasPost(post1)).toBeTruthy();

    await thread.removePost(post1);
    expect(await thread.hasPost(post1)).toBeFalsy();
  });

  it("should have automatically generated association methods for the Post model", async () => {
    const { Thread } = db.getModels();
    const thread = await Thread.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("Post");
    const availableMethods = getAllMethods(thread);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the Topic model", async () => {
    const { Thread } = db.getModels();
    const thread = await Thread.create({ title: "test" });

    const expectedMethods = generateBelongsToAssociationMethods("Topic");
    const availableMethods = getAllMethods(thread);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should create a thread and associate the given topic through its ID", async () => {
    const { Thread, Topic } = db.getModels();

    const topic = await Topic.create({ title: "test" });
    const thread = await Thread.create({
      title: "test",
      topicId: topic.id
    });

    expect(thread).toBeDefined();

    const associatedTopic = await thread.getTopic();
    expect(associatedTopic).not.toBeNull();
    expect(associatedTopic.id).toEqual(topic.id);
  });

  it("should create a thread together with it's associated topic", async () => {
    const { Thread, Topic } = db.getModels();

    const thread = await Thread.create({
      title: "test",
      topic: {
        title: "testTopic"
      }
    }, {
      include: [ Topic ]
    });

    expect(thread).toBeDefined();

    const associatedTopic = await thread.getTopic();
    expect(associatedTopic).not.toBeNull();
    expect(associatedTopic.title).toEqual("testTopic");
  });
});
