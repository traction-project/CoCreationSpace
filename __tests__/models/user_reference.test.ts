import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("User references user tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { UserReference, User, Post } = db.getModels();

    await UserReference.destroy({ truncate: true });
    await User.destroy({ truncate: true });
    await Post.destroy({ truncate: true });
  });

  it("should be user1 referenced by post1", async () => {
    const { Post, User } = db.getModels();
    const user1 = await User.create({ username: "user1" });
    const post1 = await Post.create({ title: "New post" });

    expect(await post1.hasUserReferenced([user1])).toBeFalsy();

    await post1.addUserReferenced(user1);

    expect(await post1.hasUserReferenced([user1])).toBeTruthy();
    expect(await user1.hasPostReferenced([post1])).toBeTruthy();
  });

  it("should be user1 referenced by post1 and post2", async () => {
    const { Post, User } = db.getModels();
    const user1 = await User.create({ username: "user1" });
    const post1 = await Post.create({ title: "New post" });
    const post2 = await Post.create({ title: "Media post" });

    expect(await post1.hasUserReferenced([user1])).toBeFalsy();
    expect(await post2.hasUserReferenced([user1])).toBeFalsy();

    await post1.addUserReferenced(user1);
    await post2.addUserReferenced(user1);

    expect(await post1.hasUserReferenced([user1])).toBeTruthy();
    expect(await post2.hasUserReferenced([user1])).toBeTruthy();
    expect(await user1.hasPostReferenced([post1, post2])).toBeTruthy();
  });

  it("should post1 remove reference to user1", async () => {
    const { Post, User } = db.getModels();
    const user1 = await User.create({ username: "user1" });
    const post1 = await Post.create({ title: "New post" });

    await post1.addUserReferenced(user1);
    expect(await post1.hasUserReferenced([user1])).toBeTruthy();
    expect(await user1.hasPostReferenced([post1])).toBeTruthy();

    await post1.removeUserReferenced([user1]);
    expect(await post1.hasUserReferenced([user1])).toBeFalsy();
    expect(await user1.hasPostReferenced([post1])).toBeFalsy();
  });

});
