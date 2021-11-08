import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("User interest topic", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Interest, User, Topic } = db.getModels();

    await Interest.destroy({ truncate: true });
    await User.destroy({ truncate: true });
    await Topic.destroy({ truncate: true });
  });

  it("should user has a new topic interest", async () => {
    const { User, Topic } = db.getModels();
    const user = await User.create({ username: "test" });
    const topic = await Topic.create({ title: "sports" });

    await user.addInterestedTopic(topic);

    expect(await user.hasInterestedTopic(topic)).toBeTruthy();
  });

  it("should user can remove topic interest", async () => {
    const { User, Topic } = db.getModels();
    const user = await User.create({ username: "test" });
    const topic = await Topic.create({ title: "sports" });

    await user.addInterestedTopic(topic);
    expect(await user.hasInterestedTopic(topic)).toBeTruthy();

    await user.removeInterestedTopic(topic);
    expect(await user.hasInterestedTopic(topic)).toBeFalsy();
  });

  it("should can count user' interests topics", async () => {
    const { User, Topic } = db.getModels();
    const user = await User.create({ username: "test" });
    const topic1 = await Topic.create({ title: "sports" });
    const topic2 = await Topic.create({ title: "media" });

    expect(await user.countInterestedTopics()).toEqual(0);
    await user.addInterestedTopics([topic1, topic2]);
    expect(await user.countInterestedTopics()).toEqual(2);
  });

  it("should can count users interested in a specific topic", async () => {
    const { User, Topic } = db.getModels();
    const user1 = await User.create({ username: "test" });
    const user2 = await User.create({ username: "test2" });
    const topic = await Topic.create({ title: "sports" });

    expect(await topic.countInterestedUsers()).toEqual(0);
    await topic.addInterestedUser(user1);
    await topic.addInterestedUser(user2);
    expect(await topic.countInterestedUsers()).toEqual(2);
  });

});
