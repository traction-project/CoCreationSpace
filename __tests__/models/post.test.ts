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
    const { Post, Thread } = db.getModels();

    await Post.destroy({ truncate: true });
    await Thread.destroy({ truncate: true });
  });

  it("should create a post with associated data container", async () => {
    const { User, Post, DataContainer } = db.getModels();

    const post = Post.build({
      userId: (await User.findOne({}))!.id,
      dataContainer: DataContainer.build({
        textContent: "This is a comment"
      }),
      second: 0
    }, {
      include: [ association.getAssociatons().postAssociations.PostDataContainer ]
    });

    await post.save();
    const { dataContainer } = post;

    expect(dataContainer).toBeDefined();
    expect((dataContainer as DataContainerAttributes).textContent).toEqual("This is a comment");

    expect(await DataContainer.count()).toEqual(1);
  });

  it("should create a post with the property 'published' initialised to 'true'", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });

    expect(post.isNewRecord).toBeFalsy();
    expect(post.published).toEqual(true);
  });

  it("should create a post with the property 'published' explicitly set to false", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
      published: false
    });

    expect(post.isNewRecord).toBeFalsy();
    expect(post.published).toEqual(false);
  });

  it("should return posts based on the value of the property published", async () => {
    const { User, Post } = db.getModels();

    await Post.create({
      title: "post1",
      userId: (await User.findOne({}))!.id,
      published: false
    });
    await Post.create({
      title: "post2",
      userId: (await User.findOne({}))!.id,
      published: true
    });
    await Post.create({
      title: "post3",
      userId: (await User.findOne({}))!.id,
      published: false
    });

    const draftPosts = await Post.findAll({ where: { published: false }});
    expect(draftPosts.length).toEqual(2);

    const publishedPosts = await Post.findAll({ where: { published: true }});
    expect(publishedPosts.length).toEqual(1);

    const allPosts = await Post.findAll();
    expect(allPosts.length).toEqual(3);
  });

  it("should retrieve all comments for a post", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });

    expect(await post.countComments()).toEqual(0);

    const comment1 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    expect(await post.countComments()).toEqual(1);
    expect(await post.hasComment(comment1)).toBeTruthy();

    const comment2 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    expect(await post.countComments()).toEqual(2);
    expect(await post.hasComments([comment1, comment2])).toBeTruthy();
  });

  it("should delete all comments if a post is deleted", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });

    const comment1 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    const comment1Child = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: comment1.id
    });

    const comment2 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
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
      userId: (await User.findOne({}))!.id,
    });

    const comment1 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    const comment1Child = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: comment1.id
    });

    const comment2 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    expect(await post.countComments()).toEqual(2);

    await comment1.destroyWithComments();

    expect(await Post.findByPk(post.id)).not.toBeNull();
    expect(await Post.findByPk(comment2.id)).not.toBeNull();

    expect(await Post.findByPk(comment1.id)).toBeNull();
    expect(await Post.findByPk(comment1Child.id)).toBeNull();
  });

  it("should delete the associated thread if it becomes empty through deleting posts", async () => {
    const { User, Post, Thread } = db.getModels();

    const thread = await Thread.create({ title: "thread" });

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
      threadId: thread.id
    });

    const comment1 = await Post.create({
      userId: (await User.findOne({}))!.id,
      threadId: thread.id,
      parentPostId: post.id
    });

    await Post.create({
      userId: (await User.findOne({}))!.id,
      threadId: thread.id,
      parentPostId: comment1.id
    });

    await Post.create({
      userId: (await User.findOne({}))!.id,
      threadId: thread.id,
      parentPostId: post.id
    });

    expect(await Thread.count()).toEqual(1);
    expect(await thread.countPosts()).toEqual(4);

    await comment1.destroyWithCommentsAndThread();

    expect(await Thread.count()).toEqual(1);
    expect(await thread.countPosts()).toEqual(2);

    await post.destroyWithCommentsAndThread();

    expect(await Thread.count()).toEqual(0);
  });

  it("should retrieve the parent post", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });

    const comment1 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    const parent = await comment1.getParentPost();

    expect(parent).toBeDefined();
    expect(parent!.id).toEqual(post.id);
  });

  it("should return null if there is no parent post", async () => {
    const { User, Post } = db.getModels();

    const comment1 = await Post.create({
      userId: (await User.findOne({}))!.id,
    });

    const parent = await comment1.getParentPost();
    expect(parent).toBeNull();
  });

  it("should return the associated user group", async () => {
    const { User, Post, Thread, Topic, UserGroup } = db.getModels();

    const group = await UserGroup.create({ name: "some group" });

    const topic = await Topic.create({ title: "some topic" });
    await topic.setUserGroup(group);

    const thread = await Thread.create({ title: "some thread" });
    await thread.setTopic(topic);

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });
    await post.setThread(thread);

    const associatedGroup = await post.getUserGroup();

    expect(associatedGroup).toBeDefined();
    expect(associatedGroup!.name).toEqual("some group");
  });

  it("should return null if the post has no topic", async () => {
    const { User, Post, Thread } = db.getModels();

    const thread = await Thread.create({ title: "some thread" });

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });
    await post.setThread(thread);

    const associatedGroup = await post.getUserGroup();
    expect(associatedGroup).toBeNull();
  });

  it("should return 0 for comment count if a post has no comments", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });

    expect(await post.countAllComments()).toEqual(0);
  });

  it("should count a post's comments if the post only has top-level comments", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });

    await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    expect(await post.countAllComments()).toEqual(2);
  });

  it("should count a post's comments recursively", async () => {
    const { User, Post } = db.getModels();

    const post = await Post.create({
      userId: (await User.findOne({}))!.id,
    });

    const comment1 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    const comment2 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: comment1.id
    });

    await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: comment2.id
    });

    const comment3 = await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: post.id
    });

    await Post.create({
      userId: (await User.findOne({}))!.id,
      parentPostId: comment3.id
    });

    expect(await post.countAllComments()).toEqual(5);
  });

  it("should add a post to a user's favourites", async () => {
    const { User, Post } = db.getModels();

    const user = await User.create({ username: "user4" });
    const post = await Post.create({ title: "post" });

    expect(await post.countFavourites()).toEqual(0);

    await post.addFavourite(user);
    expect(await post.countFavourites()).toEqual(1);

    const favourite = (await post.getFavourites())[0];
    expect(favourite.id).toEqual(user.id);
  });

  it("should remove a post from a user's favourites", async () => {
    const { User, Post } = db.getModels();

    const user = await User.create({ username: "user2" });
    const post = await Post.create({ title: "post" });

    await post.addFavourite(user);
    expect(await user.countFavourites()).toEqual(1);

    await post.removeFavourite(user);
    expect(await post.countFavourites()).toEqual(0);
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

  it("should have automatically generated association methods for the self-referential comment relation", async () => {
    const { Post } = db.getModels();
    const post = await Post.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("Comment");
    const availableMethods = getAllMethods(post);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the User model through Favourite", async () => {
    const { Post } = db.getModels();
    const post = await Post.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("Favourite");
    const availableMethods = getAllMethods(post);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
