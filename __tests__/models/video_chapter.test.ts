import { Sequelize } from "sequelize";
import { generateBelongsToAssociationMethods, getAllMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("VideoChapter model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { MediaItem, VideoChapter } = db.getModels();

    await VideoChapter.destroy({ truncate: true });
    await MediaItem.destroy({ truncate: true });
  });

  it("should create a basic VideoChapter entry", async () => {
    const { VideoChapter } = db.getModels();

    const chapter = await VideoChapter.create({
      name: "Chapter 1",
      startTime: 0
    });

    expect(chapter.name).toEqual("Chapter 1");
    expect(chapter.startTime).toEqual(0);
    expect(await VideoChapter.count()).toEqual(1);
  });

  it("should create a basic VideoChapter entry and associate it to a MediaItem", async () => {
    const { MediaItem, VideoChapter } = db.getModels();

    const chapter = await VideoChapter.create({
      name: "Chapter 1",
      startTime: 0
    });

    const mediaItem = await MediaItem.create({ title: "test" });

    expect(await chapter.getMediaItem()).toBeNull();
    chapter.setMediaItem(mediaItem);

    expect(await chapter.getMediaItem()).not.toBeNull();
    expect((await chapter.getMediaItem()).id).toEqual(mediaItem.id);
  });

  it("should be possible to add multiple chapters to a MediaItem instance", async () => {
    const { MediaItem, VideoChapter } = db.getModels();

    const chapter1 = await VideoChapter.create({ name: "Chapter 1", startTime: 0 });
    const chapter2 = await VideoChapter.create({ name: "Chapter 2", startTime: 5 });
    const chapter3 = await VideoChapter.create({ name: "Chapter 3", startTime: 10 });
    const chapter4 = await VideoChapter.create({ name: "Chapter 4", startTime: 20 });

    const mediaItem = await MediaItem.create({ title: "test" });
    expect(await mediaItem.countVideoChapters()).toEqual(0);

    await mediaItem.addVideoChapters([chapter1, chapter2, chapter3, chapter4]);
    expect(await mediaItem.countVideoChapters()).toEqual(4);
  });

  it("should have automatically generated association methods for the MediaItem model", async () => {
    const { VideoChapter } = db.getModels();
    const videoChapter = await VideoChapter.create({ name: "test", startTime: 0 });

    const expectedMethods = generateBelongsToAssociationMethods("MediaItem");
    const availableMethods = getAllMethods(videoChapter);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
