import { Sequelize } from "sequelize";
import { getAllMethods, generateBelongsToAssociationMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Subtitles tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Subtitle, MediaItem } = db.getModels();

    await Subtitle.destroy({ truncate: true });
    await MediaItem.destroy({ truncate: true });
  });

  it("should create new subtitle with mandatory attributes", async () => {
    const { Subtitle } = db.getModels();

    const subtitle = await Subtitle.create({ content: "subtitle" });
    const subtitleSaved = await Subtitle.findOne({ where: { content: "subtitle" } });

    expect(subtitle).toBeDefined();
    expect(subtitleSaved).toBeDefined();
    expect(subtitle.id).toEqual(subtitleSaved!.id);
  });

  it("should create new subtitle with optional attributes", async () => {
    const { Subtitle } = db.getModels();

    const subtitle = await Subtitle.create(
      {
        content: "subtitle",
        language: "es"
      }
    );
    const subtitleSaved = await Subtitle.findOne({ where: { content: "subtitle" } });

    expect(subtitle).toBeDefined();
    expect(subtitleSaved).toBeDefined();
    expect(subtitle.id).toEqual(subtitleSaved!.id);
    expect(subtitle.language).toEqual(subtitleSaved!.language);
  });

  it("should add subtitles to a multimedia", async () => {
    const { Subtitle, MediaItem } = db.getModels();
    const subtitle = await Subtitle.create({ content: "subtitle" });
    const multimedia = await MediaItem.create({ title: "multimedia" });

    expect(await subtitle.getMediaItem()).toBeNull();
    await subtitle.setMediaItem(multimedia);

    expect(await subtitle.getMediaItem()).toBeDefined();
  });

  it("should have property default set to false if confidence is unset", async () => {
    const { Subtitle } = db.getModels();

    const subtitle = await Subtitle.create({
      content: "subtitle",
      language: "es"
    });

    expect(subtitle.default).toBeFalsy();
  });

  it("should have property default set tot true if confidence is set", async () => {
    const { Subtitle } = db.getModels();

    const subtitle = await Subtitle.create({
      content: "subtitle",
      language: "es",
      confidence: 0.78
    });

    expect(subtitle.default).toBeTruthy();
  });

  it("should have automatically generated association methods for the MediaItem model", async () => {
    const { Subtitle } = db.getModels();
    const subtitle = await Subtitle.create({ content: "test" });

    const expectedMethods = generateBelongsToAssociationMethods("MediaItem");
    const availableMethods = getAllMethods(subtitle);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
