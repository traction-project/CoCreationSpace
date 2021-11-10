import { Sequelize } from "sequelize";
import { getAllMethods, generateHasManyAssociationMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Tag tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Tag, Post } = db.getModels();

    await Tag.destroy({ truncate: true });
    await Post.destroy({ truncate: true });
  });

  it("should create new tag", async () => {
    const { Tag } = db.getModels();

    const tag = await Tag.create({ name: "tag" });
    const tagSaved = await Tag.findOne({ where: { name: "tag" }});

    expect(tagSaved).toBeDefined();
    expect(tag.id).toEqual(tagSaved!.id);
  });

  it("should add tag to post", async () => {
    const { Tag, Post } = db.getModels();
    const tag = await Tag.create({ name: "tag" });
    const post = await Post.create();

    expect(await tag.hasPost(post)).toBeFalsy();
    await tag.addPost(post);
    expect(await tag.hasPost(post)).toBeTruthy();
  });

  it("should remove tag from post", async () => {
    const { Tag, Post } = db.getModels();
    const tag = await Tag.create({ name: "tag" });
    const post = await Post.create();

    await tag.addPost(post);
    expect(await tag.hasPost(post)).toBeTruthy();

    await tag.removePost(post);
    expect(await tag.hasPost(post)).toBeFalsy();
  });

  it("should one post has 2 tags", async () => {
    const { Tag, Post } = db.getModels();
    const tag1 = await Tag.create({ name: "tag1" });
    const tag2 = await Tag.create({ name: "tag2" });
    const post = await Post.create();

    expect(await post.hasTags([tag1, tag2])).toBeFalsy();
    expect(await post.countTags()).toEqual(0);

    await post.addTags([tag1, tag2]);

    expect(await post.hasTags([tag1, tag2])).toBeTruthy();
    expect(await post.countTags()).toEqual(2);
  });

  it("should one tag has 2 posts", async () => {
    const { Tag, Post } = db.getModels();

    const tag = await Tag.create({ name: "tag" });
    const post1 = await Post.create();
    const post2 = await Post.create();

    expect(await tag.hasPost(post1)).toBeFalsy();
    expect(await tag.hasPost(post2)).toBeFalsy();
    expect(await tag.countPosts()).toEqual(0);

    await post1.addTag(tag);
    await post2.addTag(tag);

    expect(await tag.hasPost(post1)).toBeTruthy();
    expect(await tag.hasPost(post2)).toBeTruthy();
    expect(await tag.countPosts()).toEqual(2);
  });

  it("should have automatically generated association methods for the Post model", async () => {
    const { Tag } = db.getModels();
    const tag = await Tag.create({ name: "test" });

    const expectedMethods = generateHasManyAssociationMethods("Post");
    const availableMethods = getAllMethods(tag);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
