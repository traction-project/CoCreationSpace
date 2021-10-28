import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Post references post tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Posts, PostReference } = db.getModels();

    await Posts.destroy({ truncate: true });
    await PostReference.destroy({ truncate: true });
  });

  it("should post1 references to post2", async () => {
    const { Posts } = db.getModels();
    const post1 = await Posts.create({ title: "New post" });
    const post2 = await Posts.create({ title: "Sports" });

    await post1.addPostReference(post2);

    expect(await post1.hasPostReference(post2)).toBeTruthy();
    expect(await post2.hasPostReferenced(post1)).toBeTruthy();
  });

  it("should post1 has 2 references posts", async () => {
    const { Posts } = db.getModels();
    const post1 = await Posts.create({ title: "New post" });
    const post2 = await Posts.create({ title: "Sports" });
    const post3 = await Posts.create({ title: "Media" });

    expect(await post1.countPostReference()).toEqual(0);
    await post1.setPostReference([post2, post3]);

    expect(await post1.countPostReference()).toEqual(2);
    expect(await post1.hasPostReference(post2)).toBeTruthy();
    expect(await post1.hasPostReference(post3)).toBeTruthy();
    expect(await post2.hasPostReferenced(post1)).toBeTruthy();
    expect(await post3.hasPostReferenced(post1)).toBeTruthy();
  });

  it("should post1 remove reference to post2", async () => {
    const { Posts } = db.getModels();
    const post1 = await Posts.create({ title: "New post" });
    const post2 = await Posts.create({ title: "Sports" });

    await post1.addPostReference(post2);
    expect(await post1.hasPostReference(post2)).toBeTruthy();

    await post1.removePostReference(post2);
    expect(await post1.hasPostReference(post2)).toBeFalsy();
  });

});
