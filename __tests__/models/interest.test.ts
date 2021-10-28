import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("User interest topic", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Interest, Users, Topic } = db.getModels();

    await Interest.destroy({ truncate: true });
    await Users.destroy({ truncate: true });
    await Topic.destroy({ truncate: true });
  });

  it("should user has a new topic interest", async () => {
    const { Users, Topic } = db.getModels();
    const user = await Users.create({ username: "test" });
    const topic = await Topic.create({ title: "sports" });

    await user.addInterestedTopic(topic);

    expect(await user.hasInterestedTopic(topic)).toBeTruthy();
  });

  it("should user can remove topic interest", async () => {
    const { Users, Topic } = db.getModels();
    const user = await Users.create({ username: "test" });
    const topic = await Topic.create({ title: "sports" });

    await user.addInterestedTopic(topic);
    expect(await user.hasInterestedTopic(topic)).toBeTruthy();

    await user.removeInterestedTopic(topic);
    expect(await user.hasInterestedTopic(topic)).toBeFalsy();
  });

  it("should can count user' interests topics", async () => {
    const { Users, Topic } = db.getModels();
    const user = await Users.create({ username: "test" });
    const topic1 = await Topic.create({ title: "sports" });
    const topic2 = await Topic.create({ title: "media" });

    expect(await user.countInterestedTopics()).toEqual(0);
    await user.addInterestedTopics([topic1, topic2]);
    expect(await user.countInterestedTopics()).toEqual(2);
  });

  it("should can count users interested in a specific topic", async () => {
    const { Users, Topic } = db.getModels();
    const user1 = await Users.create({ username: "test" });
    const user2 = await Users.create({ username: "test2" });
    const topic = await Topic.create({ title: "sports" });

    expect(await topic.countHasInterest()).toEqual(0);
    await topic.addHasInterest(user1);
    await topic.addHasInterest(user2);
    expect(await topic.countHasInterest()).toEqual(2);
  });

});
