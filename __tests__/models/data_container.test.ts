import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Data container model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { DataContainer, Post, MediaItem } = db.getModels();

    await DataContainer.destroy({ truncate: true });
    await Post.destroy({ truncate: true });
    await MediaItem.destroy({ truncate: true });
  });

  it("should create new data contaienr with text_content", async () => {
    const { DataContainer } = db.getModels();

    const text_content = "data";
    const dataContainer = await DataContainer.build({
      text_content
    }).save();

    expect(dataContainer.text_content).toEqual(text_content);

    expect(dataContainer.id).toBeDefined();
    expect(dataContainer.createdAt).toBeDefined();
    expect(dataContainer.updatedAt).toBeDefined();

    expect(dataContainer.createdAt).toEqual(dataContainer.updatedAt);
  });

  it("should create new data contaienr empty", async () => {
    const { DataContainer } = db.getModels();

    const dataContainer = await DataContainer.create();

    expect(dataContainer.id).toBeDefined();
    expect(dataContainer.createdAt).toBeDefined();
    expect(dataContainer.updatedAt).toBeDefined();

    expect(dataContainer.createdAt).toEqual(dataContainer.updatedAt);
  });

  it("should add Post that contains data container", async () => {
    const { DataContainer, Post } = db.getModels();
    const dataContainer = await DataContainer.create({ text_content: "" });
    const post = await Post.create({ title: "post" });

    await dataContainer.setPost(post);
    const postSaved = await dataContainer.getPost();

    expect(postSaved.title).toEqual(post.title);
  });

  it("should return true when audio content has a certain multimedia", async () => {
    const { DataContainer, MediaItem } = db.getModels();

    const dataContainer = await DataContainer.create();
    const multimedia = await MediaItem.create({ title: "multimedia" });
    expect(await dataContainer.hasMediaItem(multimedia)).toBeFalsy();

    await dataContainer.addMediaItem(multimedia);
    expect(await dataContainer.hasMediaItem(multimedia)).toBeTruthy();
  });

  it("should count a data container multimedia", async () => {
    const { DataContainer, MediaItem } = db.getModels();

    const dataContainer = await DataContainer.create();
    expect(await dataContainer.countMediaItems()).toEqual(0);

    const multimedia = await MediaItem.create({ title: "multimedia" });
    await dataContainer.addMediaItem(multimedia);

    expect(await dataContainer.countMediaItems()).toEqual(1);
  });

  it("should remove a certain multimedia", async () => {
    const { DataContainer, MediaItem } = db.getModels();
    const dataContainer = await DataContainer.create();
    const multimedia = await MediaItem.create({ title: "multimedia" });

    await dataContainer.addMediaItem(multimedia);
    expect(await dataContainer.hasMediaItem(multimedia)).toBeTruthy();

    await dataContainer.removeMediaItem(multimedia);
    expect(await dataContainer.hasMediaItem(multimedia)).toBeFalsy();
  });

  it("should return true when data container has a certain series of multimedias", async () => {
    const { DataContainer, MediaItem } = db.getModels();
    const dataContainer = await DataContainer.create();
    const multimedia1 = await MediaItem.create({ title: "multimedia1" });
    const multimedia2 = await MediaItem.create({ title: "multimedia2" });
    const multimedia3 = await MediaItem.create({ title: "multimedia3" });

    await dataContainer.setMediaItems([multimedia1, multimedia2, multimedia3]);

    expect(await dataContainer.countMediaItems()).toEqual(3);

    const [multimedia1Saved, multimedia2Saved, multimedia3Saved] = await dataContainer.getMediaItems();

    expect(multimedia1.id).toEqual(multimedia1Saved.id);
    expect(multimedia2.id).toEqual(multimedia2Saved.id);
    expect(multimedia3.id).toEqual(multimedia3Saved.id);
  });

  it("should not fail when trying to remove an multimedia that the data container does not have", async () => {
    const { DataContainer, MediaItem } = db.getModels();
    const dataContainer = await DataContainer.create();

    const multimedia1 = await MediaItem.create({ title: "multimedia1" });
    const multimedia2 = await MediaItem.create({ title: "multimedia2" });
    const multimedia3 = await MediaItem.create({ title: "multimedia3" });

    await dataContainer.addMediaItem(multimedia1);
    await dataContainer.addMediaItem(multimedia2);

    expect(await dataContainer.countMediaItems()).toEqual(2);

    await dataContainer.removeMediaItem(multimedia3);
    expect(await dataContainer.countMediaItems()).toEqual(2);

    await dataContainer.removeMediaItem(multimedia2);
    expect(await dataContainer.countMediaItems()).toEqual(1);
  });

});
