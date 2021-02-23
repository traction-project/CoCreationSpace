import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("EmojiReactions model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { EmojiReactions, Posts, Users } = db.getModels();

    await EmojiReactions.destroy({ truncate: true });
    await Posts.destroy({ truncate: true });
    await Users.destroy({ truncate: true });
  });

  it("should initialise a new object", async () => {
    const { EmojiReactions, Users, Multimedia } = db.getModels();

    const user = await Users.create({ username: "admin" });
    const video = await Multimedia.create({ title: "video 1" });

    const reaction = await EmojiReactions.build({
      emoji: "😋",
      user_id: user.id,
      multimedia_id: video.id
    }).save();

    expect(reaction.id).toBeDefined();
    expect(reaction.emoji).toBeDefined();
  });

  it("should have a numeric field 'second'", async () => {
    const { EmojiReactions, Users, Multimedia } = db.getModels();

    const user = await Users.create({ username: "admin" });
    const video = await Multimedia.create({ title: "video 2" });

    const reaction = await EmojiReactions.build({
      emoji: "😋",
      user_id: user.id,
      multimedia_id: video.id,
      second: 12.345
    }).save();

    expect(reaction.second).toBeDefined();
    expect(typeof(reaction.second)).toEqual("number");
  });

  it("should have a numeric field 'second' even after JSON conversion", async () => {
    const { EmojiReactions, Users, Multimedia } = db.getModels();

    const user = await Users.create({ username: "admin" });
    const video = await Multimedia.create({ title: "video 3" });

    const reaction = await EmojiReactions.build({
      emoji: "😋",
      user_id: user.id,
      multimedia_id: video.id,
      second: 12.345
    }).save();

    expect(reaction.second).toBeDefined();
    expect(typeof(reaction.second)).toEqual("number");

    const data = JSON.parse(JSON.stringify(reaction));
    expect(typeof(data.second)).toEqual("number");
  });
});
