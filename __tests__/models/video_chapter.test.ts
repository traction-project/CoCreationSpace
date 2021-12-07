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

  it("should create a basic NoteCollection entry", async () => {
    const { VideoChapter } = db.getModels();

    const chapter = await VideoChapter.create({
      name: "Chapter 1",
      startTime: 0
    });

    expect(chapter.name).toEqual("Chapter 1");
    expect(chapter.startTime).toEqual(0);
    expect(await VideoChapter.count()).toEqual(1);
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
