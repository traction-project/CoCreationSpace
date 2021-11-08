import { Sequelize } from "sequelize";
import { getAllMethods, generateBelongsToAssociationMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("EmojiReactions model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { EmojiReaction, Post, User } = db.getModels();

    await EmojiReaction.destroy({ truncate: true });
    await Post.destroy({ truncate: true });
    await User.destroy({ truncate: true });
  });

  it("should initialise a new object", async () => {
    const { EmojiReaction, User, MediaItem } = db.getModels();

    const user = await User.create({ username: "admin" });
    const video = await MediaItem.create({ title: "video 1" });

    const reaction = await EmojiReaction.build({
      emoji: "😋",
      user_id: user.id,
      media_item_id: video.id
    }).save();

    expect(reaction.id).toBeDefined();
    expect(reaction.emoji).toBeDefined();
  });

  it("should have a numeric field 'second'", async () => {
    const { EmojiReaction, User, MediaItem } = db.getModels();

    const user = await User.create({ username: "admin" });
    const video = await MediaItem.create({ title: "video 2" });

    const reaction = await EmojiReaction.build({
      emoji: "😋",
      user_id: user.id,
      media_item_id: video.id,
      second: 12.345
    }).save();

    expect(reaction.second).toBeDefined();
    expect(typeof(reaction.second)).toEqual("number");
  });

  it("should have a numeric field 'second' even after JSON conversion", async () => {
    const { EmojiReaction, User, MediaItem } = db.getModels();

    const user = await User.create({ username: "admin" });
    const video = await MediaItem.create({ title: "video 3" });

    const reaction = await EmojiReaction.build({
      emoji: "😋",
      user_id: user.id,
      media_item_id: video.id,
      second: 12.345
    }).save();

    expect(reaction.second).toBeDefined();
    expect(typeof(reaction.second)).toEqual("number");

    const data = JSON.parse(JSON.stringify(reaction));
    expect(typeof(data.second)).toEqual("number");
  });

  it("should retrieve the associated user from a EmojiReactions instance", async () => {
    const { EmojiReaction, User, MediaItem } = db.getModels();

    const user = await User.create({ username: "admin" });
    const video = await MediaItem.create({ title: "video 3" });

    const reaction = await EmojiReaction.build({
      emoji: "😋",
      user_id: user.id,
      media_item_id: video.id,
      second: 12.345
    }).save();

    const associatedUser = await reaction.getUser();

    expect(associatedUser).toBeDefined();
    expect(associatedUser.id).toEqual(user.id);
  });

  it("should retrieve the associated media item from a EmojiReactions instance", async () => {
    const { EmojiReaction, User, MediaItem } = db.getModels();

    const user = await User.create({ username: "admin" });
    const video = await MediaItem.create({ title: "video 3" });

    const reaction = await EmojiReaction.build({
      emoji: "😋",
      user_id: user.id,
      media_item_id: video.id,
      second: 12.345
    }).save();

    const associatedVideo = await reaction.getMediaItem();

    expect(associatedVideo).toBeDefined();
    expect(associatedVideo.id).toEqual(video.id);
  });

  it("should have automatically generated association methods for the User model", async () => {
    const { EmojiReaction, User, MediaItem } = db.getModels();

    const user = await User.create({ username: "admin" });
    const video = await MediaItem.create({ title: "video 3" });

    const emojiReaction = await EmojiReaction.create({
      emoji: "😋",
      user_id: user.id,
      media_item_id: video.id
    });

    const expectedMethods = generateBelongsToAssociationMethods("User");
    const availableMethods = getAllMethods(emojiReaction);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the User model", async () => {
    const { EmojiReaction, User, MediaItem } = db.getModels();

    const user = await User.create({ username: "admin" });
    const video = await MediaItem.create({ title: "video 3" });

    const emojiReaction = await EmojiReaction.create({
      emoji: "😋",
      user_id: user.id,
      media_item_id: video.id
    });

    const expectedMethods = generateBelongsToAssociationMethods("MediaItem");
    const availableMethods = getAllMethods(emojiReaction);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
