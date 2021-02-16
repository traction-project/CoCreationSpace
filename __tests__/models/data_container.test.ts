import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Data container model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { DataContainer, Posts, Multimedia } = db.getModels();

    await DataContainer.destroy({ truncate: true });
    await Posts.destroy({ truncate: true });
    await Multimedia.destroy({ truncate: true });
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
    const { DataContainer, Posts } = db.getModels();
    const dataContainer = await DataContainer.create({ text_content: "" });
    const post = await Posts.create({ title: "post" });

    await dataContainer.setPost(post);
    const postSaved = await dataContainer.getPost();

    expect(postSaved.title).toEqual(post.title);
  });

  it("should return true when audio content has a certain multimedia", async () => {
    const { DataContainer, Multimedia } = db.getModels();

    const dataContainer = await DataContainer.create();
    const multimedia = await Multimedia.create({ title: "multimedia" });
    expect(await dataContainer.hasMultimedia(multimedia)).toBeFalsy();

    await dataContainer.addMultimedia(multimedia);
    expect(await dataContainer.hasMultimedia(multimedia)).toBeTruthy();
  });

  it("should count a data container multimedia", async () => {
    const { DataContainer, Multimedia } = db.getModels();

    const dataContainer = await DataContainer.create();
    expect(await dataContainer.countMultimedia()).toEqual(0);

    const multimedia = await Multimedia.create({ title: "multimedia" });
    await dataContainer.addMultimedia(multimedia);

    expect(await dataContainer.countMultimedia()).toEqual(1);
  });

  it("should remove a certain multimedia", async () => {
    const { DataContainer, Multimedia } = db.getModels();
    const dataContainer = await DataContainer.create();
    const multimedia = await Multimedia.create({ title: "multimedia" });

    await dataContainer.addMultimedia(multimedia);
    expect(await dataContainer.hasMultimedia(multimedia)).toBeTruthy();

    await dataContainer.removeMultimedia(multimedia);
    expect(await dataContainer.hasMultimedia(multimedia)).toBeFalsy();
  });

  it("should return true when data container has a certain series of multimedias", async () => {
    const { DataContainer, Multimedia } = db.getModels();
    const dataContainer = await DataContainer.create();
    const multimedia1 = await Multimedia.create({ title: "multimedia1" });
    const multimedia2 = await Multimedia.create({ title: "multimedia2" });
    const multimedia3 = await Multimedia.create({ title: "multimedia3" });

    await dataContainer.setMultimedia([multimedia1, multimedia2, multimedia3]);

    expect(await dataContainer.countMultimedia()).toEqual(3);

    const [multimedia1Saved, multimedia2Saved, multimedia3Saved] = await dataContainer.getMultimedia();
    expect(multimedia1.id).toEqual(multimedia1Saved.id);
    expect(multimedia2.id).toEqual(multimedia2Saved.id);
    expect(multimedia3.id).toEqual(multimedia3Saved.id);
  });

  it("should not fail when trying to remove an multimedia that the data container does not have", async () => {
    const { DataContainer, Multimedia } = db.getModels();
    const dataContainer = await DataContainer.create();
    const multimedia1 = await Multimedia.create({ title: "multimedia1" });
    const multimedia2 = await Multimedia.create({ title: "multimedia2" });
    const multimedia3 = await Multimedia.create({ title: "multimedia3" });

    await dataContainer.addMultimedia(multimedia1);
    await dataContainer.addMultimedia(multimedia2);
    expect(await dataContainer.countMultimedia()).toEqual(2);

    await dataContainer.removeMultimedia(multimedia3);
    expect(await dataContainer.countMultimedia()).toEqual(2);

    await dataContainer.removeMultimedia(multimedia2);
    expect(await dataContainer.countMultimedia()).toEqual(1);
  });

});
