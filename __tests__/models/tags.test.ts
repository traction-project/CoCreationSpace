import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Preferences tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Tags, Posts } = db.getModels();

    await Tags.destroy({ truncate: true });
    await Posts.destroy({ truncate: true });
  });

  it("should create new tag", async () => {
    const { Tags } = db.getModels();

    const tag = await Tags.create({ tag_name: "tag" });
    const tagSaved = await Tags.findOne({ where: { tag_name: "tag" }});

    expect(tagSaved).toBeDefined();
    expect(tag.id).toEqual(tagSaved!.id);
  });

  it("should add tag to post", async () => {
    const { Tags, Posts } = db.getModels();
    const tag = await Tags.create({ tag_name: "tag" });
    const post = await Posts.create();

    expect(await tag.hasPost(post)).toBeFalsy();
    await tag.addPost(post);
    expect(await tag.hasPost(post)).toBeTruthy();
  });

  it("should remove tag from post", async () => {
    const { Tags, Posts } = db.getModels();
    const tag = await Tags.create({ tag_name: "tag" });
    const post = await Posts.create();

    await tag.addPost(post);
    expect(await tag.hasPost(post)).toBeTruthy();
    await tag.removePost(post);
    expect(await tag.hasPost(post)).toBeFalsy();
  });

  it("should one post has 2 tags", async () => {
    const { Tags, Posts } = db.getModels();
    const tag1 = await Tags.create({ tag_name: "tag1" });
    const tag2 = await Tags.create({ tag_name: "tag2" });
    const post = await Posts.create();

    expect(await post.hasTags([tag1, tag2])).toBeFalsy();
    expect(await post.countTags()).toEqual(0);
    await post.addTags([tag1, tag2]);
    expect(await post.hasTags([tag1, tag2])).toBeTruthy();
    expect(await post.countTags()).toEqual(2);
  });

  it("should one tag has 2 posts", async () => {
    const { Tags, Posts } = db.getModels();
    const tag = await Tags.create({ tag_name: "tag" });
    const post1 = await Posts.create();
    const post2 = await Posts.create();

    expect(await tag.hasPost(post1)).toBeFalsy();
    expect(await tag.hasPost(post2)).toBeFalsy();
    expect(await tag.countPost()).toEqual(0);
    await post1.addTag(tag);
    await post2.addTag(tag);
    expect(await tag.hasPost(post1)).toBeTruthy();
    expect(await tag.hasPost(post2)).toBeTruthy();
    expect(await tag.countPost()).toEqual(2);
  });

});
