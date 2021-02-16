import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("User likes post tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { Preferences } = db.getModels();
    await Preferences.create({ language: "en" });
  });

  beforeEach(async () => {
    const { Preferences, Users } = db.getModels();

    await Preferences.destroy({ truncate: true });
    await Users.destroy({ truncate: true });
  });

  it("should create new preferences", async () => {
    const { Preferences } = db.getModels();

    const preferences = await Preferences.create({ language: "es" });
    const preferencesSaved = await Preferences.findOne({ where: { language: "es" }});

    expect(preferencesSaved).toBeDefined();
    expect(preferences.id).toEqual(preferencesSaved!.id);
  });

  it("should assing preferences to user", async () => {
    const { Preferences, Users } = db.getModels();
    const preferences = await Preferences.findOne({ where: { language: "en" }});
    const user = await Users.create({ username: "user" });

    expect(await user.getPreferences()).toBeNull();
    await user.setPreferences(preferences!);
    expect(await user.getPreferences()).toBeDefined();
  });

  // it("should user like new post", async () => {
  //   const { Users, Posts } = db.getModels();
  //   const user = await Users.create({ username: "test" });
  //   const post = await Posts.create({ title: "sports" });

  //   await user.addLikesPost(post);

  //   expect(await user.hasLikesPost(post)).toBeTruthy();
  // });

  // it("should user can dislike post", async () => {
  //   const { Users, Posts } = db.getModels();
  //   const user = await Users.create({ username: "test" });
  //   const post = await Posts.create({ title: "sports" });

  //   await user.addLikesPost(post);
  //   expect(await user.hasLikesPost(post)).toBeTruthy();

  //   await user.removeLikesPost(post);
  //   expect(await user.hasLikesPost(post)).toBeFalsy();
  // });

  // it("should can count user' total likes", async () => {
  //   const { Users, Posts } = db.getModels();
  //   const user = await Users.create({ username: "test" });
  //   const post1 = await Posts.create({ title: "sports" });
  //   const post2 = await Posts.create({ title: "media" });

  //   expect(await user.countLikesPosts()).toEqual(0);
  //   await user.addLikesPosts([post1, post2]);
  //   expect(await user.countLikesPosts()).toEqual(2);
  // });

  // it("should can count users likes in a specific post", async () => {
  //   const { Users, Posts } = db.getModels();
  //   const user1 = await Users.create({ username: "test" });
  //   const user2 = await Users.create({ username: "test2" });
  //   const post = await Posts.create({ title: "sports" });

  //   expect(await post.countLikesUsers()).toEqual(0);
  //   await post.addLikesUsers([user1, user2]);
  //   expect(await post.countLikesUsers()).toEqual(2);
  // });

});
