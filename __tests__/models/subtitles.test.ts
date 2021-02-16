import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Subtitles tests", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { Subtitles, Multimedia } = db.getModels();

    await Subtitles.destroy({ truncate: true });
    await Multimedia.destroy({ truncate: true });
  });

  it("should create new subtitle with mandatory attributes", async () => {
    const { Subtitles } = db.getModels();

    const subtitle = await Subtitles.create({ content: "subtitle" });
    const subtitleSaved = await Subtitles.findOne({ where: { content: "subtitle" } });

    expect(subtitle).toBeDefined();
    expect(subtitleSaved).toBeDefined();
    expect(subtitle.id).toEqual(subtitleSaved!.id);
  });

  it("should create new subtitle with optional attributes", async () => {
    const { Subtitles } = db.getModels();

    const subtitle = await Subtitles.create(
      {
        content: "subtitle",
        language: "es"
      }
    );
    const subtitleSaved = await Subtitles.findOne({ where: { content: "subtitle" } });

    expect(subtitle).toBeDefined();
    expect(subtitleSaved).toBeDefined();
    expect(subtitle.id).toEqual(subtitleSaved!.id);
    expect(subtitle.language).toEqual(subtitleSaved!.language);
  });

  it("should add subtitles to a multimedia", async () => {
    const { Subtitles, Multimedia } = db.getModels();
    const subtitle = await Subtitles.create({ content: "subtitle" });
    const multimedia = await Multimedia.create({ title: "multimedia" });

    expect(await subtitle.getMultimedia()).toBeNull();
    await subtitle.setMultimedia(multimedia);

    expect(await subtitle.getMultimedia()).toBeDefined();
  });

});
