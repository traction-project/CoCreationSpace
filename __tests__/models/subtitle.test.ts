import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Subtitles tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Subtitle, Multimedia } = db.getModels();

    await Subtitle.destroy({ truncate: true });
    await Multimedia.destroy({ truncate: true });
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
    const { Subtitle, Multimedia } = db.getModels();
    const subtitle = await Subtitle.create({ content: "subtitle" });
    const multimedia = await Multimedia.create({ title: "multimedia" });

    expect(await subtitle.getMultimedia()).toBeNull();
    await subtitle.setMultimedia(multimedia);

    expect(await subtitle.getMultimedia()).toBeDefined();
  });

  it("should return false when calling isDefault if confidence is unset", async () => {
    const { Subtitle } = db.getModels();

    const subtitle = await Subtitle.create({
      content: "subtitle",
      language: "es"
    });

    expect(subtitle.isDefault()).toBeFalsy();
  });

  it("should return true when calling isDefault if confidence is set", async () => {
    const { Subtitle } = db.getModels();

    const subtitle = await Subtitle.create({
      content: "subtitle",
      language: "es",
      confidence: 0.78
    });

    expect(subtitle.isDefault()).toBeTruthy();
  });
});
