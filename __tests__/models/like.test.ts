import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("User likes post tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Like, User, Post } = db.getModels();

    await Like.destroy({ truncate: true });
    await User.destroy({ truncate: true });
    await Post.destroy({ truncate: true });
  });

  it("should user like new post", async () => {
    const { User, Post } = db.getModels();
    const user = await User.create({ username: "test" });
    const post = await Post.create({ title: "sports" });

    await user.addLikedPost(post);

    expect(await user.hasLikedPost(post)).toBeTruthy();
  });

  it("should user can dislike post", async () => {
    const { User, Post } = db.getModels();
    const user = await User.create({ username: "test" });
    const post = await Post.create({ title: "sports" });

    await user.addLikedPost(post);
    expect(await user.hasLikedPost(post)).toBeTruthy();

    await user.removeLikedPost(post);
    expect(await user.hasLikedPost(post)).toBeFalsy();
  });

  it("should can count user' total likes", async () => {
    const { User, Post } = db.getModels();

    const user = await User.create({ username: "test" });
    const post1 = await Post.create({ title: "sports" });
    const post2 = await Post.create({ title: "media" });

    expect(await user.countLikedPosts()).toEqual(0);
    await user.addLikedPosts([post1, post2]);
    expect(await user.countLikedPosts()).toEqual(2);
  });

  it("should can count users likes in a specific post", async () => {
    const { User, Post } = db.getModels();
    const user1 = await User.create({ username: "test" });
    const user2 = await User.create({ username: "test2" });
    const post = await Post.create({ title: "sports" });

    expect(await post.countLikedUsers()).toEqual(0);
    await post.addLikedUsers([user1, user2]);
    expect(await post.countLikedUsers()).toEqual(2);
  });

});
