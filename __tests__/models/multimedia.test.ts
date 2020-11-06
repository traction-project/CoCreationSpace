import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Posts model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Multimedia } = db.getModels();
    await Multimedia.destroy({ truncate: true });
  });

  it("should create a multimedia entry with a array for the field 'resolutions'", async () => {
    const { Multimedia } = db.getModels();

    const mediaItem = await Multimedia.build({
      title: "test",
      resolutions: [240, 360, 720]
    }).save();

    expect(mediaItem.id).toBeDefined();
    expect(mediaItem.resolutions).toBeDefined();
    expect(mediaItem.resolutions).toEqual([240, 360, 720]);
  });

  it("should create a multimedia entry with a array for the field 'thumbnails'", async () => {
    const { Multimedia } = db.getModels();

    const mediaItem = await Multimedia.build({
      title: "test",
      thumbnails: ["thumbnail1", "thumbnail2", "thumbnail3"]
    }).save();

    expect(mediaItem.id).toBeDefined();
    expect(mediaItem.thumbnails).toBeDefined();
    expect(mediaItem.thumbnails).toEqual(
      ["thumbnail1", "thumbnail2", "thumbnail3"]
    );
  });
});
