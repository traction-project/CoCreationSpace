import { Sequelize } from "sequelize";

import { DataContainerAttributes } from "../../models/data_container";
import { getAllMethods, generateHasOneAssociationMethods, generateBelongsToAssociationMethods, generateHasManyAssociationMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";
import association from "../../models/associations";

describe("Post model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);

    const { User } = db.getModels();
    await User.create({
      username: "admin"
    });
  });

  beforeEach(async () => {
    const { Post } = db.getModels();
    await Post.destroy({ truncate: true });
  });

  it("should create a post with associated data container", async () => {
    const { User, Post, DataContainer } = db.getModels();

    const post = Post.build({
      user_id: (await User.findOne({}))!.id,
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
    const { User, Post } = db.getModels();

    const post = await Post.create({
      user_id: (await User.findOne({}))!.id,
    });

    expect(await post.countComments()).toEqual(0);

    const comment1 = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: post.id
    });

    expect(await post.countComments()).toEqual(1);
    expect(await post.hasComment(comment1)).toBeTruthy();

    const comment2 = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: post.id
    });

    expect(await post.countComments()).toEqual(2);
    expect(await post.hasComments([comment1, comment2])).toBeTruthy();
  });

  it("should delete all comments if a post is deleted", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      user_id: (await User.findOne({}))!.id,
    });

    const comment1 = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: post.id
    });

    const comment1Child = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: comment1.id
    });

    const comment2 = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: post.id
    });

    expect(await post.countComments()).toEqual(2);

    await post.destroyWithComments();

    expect(await Post.findByPk(post.id)).toBeNull();
    expect(await Post.findByPk(comment1.id)).toBeNull();
    expect(await Post.findByPk(comment2.id)).toBeNull();
    expect(await Post.findByPk(comment1Child.id)).toBeNull();
  });

  it("should only delete comments which are children of the deleted post", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      user_id: (await User.findOne({}))!.id,
    });

    const comment1 = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: post.id
    });

    const comment1Child = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: comment1.id
    });

    const comment2 = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: post.id
    });

    expect(await post.countComments()).toEqual(2);

    await comment1.destroyWithComments();

    expect(await Post.findByPk(post.id)).not.toBeNull();
    expect(await Post.findByPk(comment2.id)).not.toBeNull();

    expect(await Post.findByPk(comment1.id)).toBeNull();
    expect(await Post.findByPk(comment1Child.id)).toBeNull();
  });

  it("should retrieve the parent post", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      user_id: (await User.findOne({}))!.id,
    });

    const comment1 = await Post.create({
      user_id: (await User.findOne({}))!.id,
      parent_post_id: post.id
    });

    const parent = await comment1.getParentPost();

    expect(parent).toBeDefined();
    expect(parent!.id).toEqual(post.id);
  });

  it("should return null if there is no parent post", async () => {
    const { User, Post } = db.getModels();

    const comment1 = await Post.create({
      user_id: (await User.findOne({}))!.id,
    });

    const parent = await comment1.getParentPost();
    expect(parent).toBeNull();
  });

  it("should return the associated user group", async () => {
    const { User, Post, Thread, Topic, UserGroup } = db.getModels();

    const group = await UserGroup.create({ name: "some group" });

    const topic = await Topic.create({ title: "some topic" });
    await topic.setUserGroup(group);

    const thread = await Thread.create({ th_title: "some thread" });
    await thread.setTopic(topic);

    const post = await Post.create({
      user_id: (await User.findOne({}))!.id,
    });
    await post.setThread(thread);

    const associatedGroup = await post.getUserGroup();

    expect(associatedGroup).toBeDefined();
    expect(associatedGroup!.name).toEqual("some group");
  });

  it("should return null if the post has no topic", async () => {
    const { User, Post, Thread } = db.getModels();

    const thread = await Thread.create({ th_title: "some thread" });

    const post = await Post.create({
      user_id: (await User.findOne({}))!.id,
    });
    await post.setThread(thread);

    const associatedGroup = await post.getUserGroup();
    expect(associatedGroup).toBeNull();
  });

  it("should have automatically generated association methods for the DataContainer model", async () => {
    const { Post } = db.getModels();
    const post = await Post.create({ title: "test" });

    const expectedMethods = generateHasOneAssociationMethods("DataContainer");
    const availableMethods = getAllMethods(post);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the Thread model", async () => {
    const { Post } = db.getModels();
    const post = await Post.create({ title: "test" });

    const expectedMethods = generateBelongsToAssociationMethods("Thread");
    const availableMethods = getAllMethods(post);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the User model", async () => {
    const { Post } = db.getModels();
    const post = await Post.create({ title: "test" });

    const expectedMethods = generateBelongsToAssociationMethods("User");
    const availableMethods = getAllMethods(post);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the Tag model", async () => {
    const { Post } = db.getModels();
    const post = await Post.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("Tag");
    const availableMethods = getAllMethods(post);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the Post model via the Like model", async () => {
    const { Post } = db.getModels();
    const post = await Post.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("LikedUser");
    const availableMethods = getAllMethods(post);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
