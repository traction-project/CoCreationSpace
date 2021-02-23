import { DataContainerAttributes } from "models/data_container";
import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";
import association from "../../models/associations";

describe("Posts model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { Users } = db.getModels();
    await Users.create({
      username: "admin"
    });
  });

  beforeEach(async () => {
    const { Posts } = db.getModels();
    await Posts.destroy({ truncate: true });
  });

  it("should create a post with associated data container", async () => {
    const { Users, Posts, DataContainer } = db.getModels();

    const post = Posts.build({
      user_id: (await Users.findOne({}))!.id,
      dataContainer: DataContainer.build({
        text_content: "This is a comment"
      }),
      second: 0
    }, {
      include: [ association.getAssociatons().postAssociations.PostDataContainer ]
    });

    await post.save();
    const { dataContainer } = post;

    expect(dataContainer).toBeDefined();
    expect((dataContainer as DataContainerAttributes).text_content).toEqual("This is a comment");

    expect(await DataContainer.count()).toEqual(1);
  });

  it("should retrieve all comments for a post", async () => {
    const { Users, Posts } = db.getModels();

    const post = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
    });

    expect(await post.countComments()).toEqual(0);

    const comment1 = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
      parent_post_id: post.id
    });

    expect(await post.countComments()).toEqual(1);
    expect(await post.hasComment(comment1)).toBeTruthy();

    const comment2 = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
      parent_post_id: post.id
    });

    expect(await post.countComments()).toEqual(2);
    expect(await post.hasComments([comment1, comment2])).toBeTruthy();
  });

  it("should delete all comments if a post is deleted", async () => {
    const { Users, Posts } = db.getModels();

    const post = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
    });

    const comment1 = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
      parent_post_id: post.id
    });

    const comment1Child = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
      parent_post_id: comment1.id
    });

    const comment2 = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
      parent_post_id: post.id
    });

    expect(await post.countComments()).toEqual(2);

    await post.destroyWithComments();

    expect(await Posts.findByPk(post.id)).toBeNull();
    expect(await Posts.findByPk(comment1.id)).toBeNull();
    expect(await Posts.findByPk(comment2.id)).toBeNull();
    expect(await Posts.findByPk(comment1Child.id)).toBeNull();
  });

  it("should only delete comments which are children of the deleted post", async () => {
    const { Users, Posts } = db.getModels();

    const post = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
    });

    const comment1 = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
      parent_post_id: post.id
    });

    const comment1Child = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
      parent_post_id: comment1.id
    });

    const comment2 = await Posts.create({
      user_id: (await Users.findOne({}))!.id,
      parent_post_id: post.id
    });

    expect(await post.countComments()).toEqual(2);

    await comment1.destroyWithComments();

    expect(await Posts.findByPk(post.id)).not.toBeNull();
    expect(await Posts.findByPk(comment2.id)).not.toBeNull();

    expect(await Posts.findByPk(comment1.id)).toBeNull();
    expect(await Posts.findByPk(comment1Child.id)).toBeNull();
  });
});
