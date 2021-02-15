import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Audio Content model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { AudioContent, Multimedia, Metadata } = db.getModels();

    await AudioContent.destroy({ truncate: true });
    await Multimedia.destroy({ truncate: true });
    await Metadata.destroy({ truncate: true });
  });

  it("should create new audio content with correct attributes", async () => {
    const { AudioContent } = db.getModels();

    const audioContent = await AudioContent.build({
      file: "audio.mp3",
      language: "es",
      audio_type: "mp3",
    }).save();

    expect(audioContent.file).toEqual("audio.mp3");
    expect(audioContent.language).toEqual("es");
    expect(audioContent.audio_type).toEqual("mp3");

    expect(audioContent.id).toBeDefined();
    expect(audioContent.createdAt).toBeDefined();
    expect(audioContent.updatedAt).toBeDefined();

    expect(audioContent.createdAt).toEqual(audioContent.updatedAt);
  });

  it("should add Multimedia to audio content", async () => {
    const { AudioContent, Multimedia } = db.getModels();
    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const multimedia = await Multimedia.create({ title: "multimedia" });

    await audioContent.setMultimedia(multimedia);
    const multimediaSaved = await audioContent.getMultimedia();

    expect(multimediaSaved.title).toEqual(multimedia.title);
  });

  it("should return true when audio content has a certain metadata", async () => {
    const { AudioContent, Metadata } = db.getModels();

    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const metadata = await Metadata.create({ value: "metadata" });
    expect(await audioContent.hasMetadata(metadata)).toBeFalsy();

    await audioContent.addMetadata(metadata);
    expect(await audioContent.hasMetadata(metadata)).toBeTruthy();
  });

  it("should count a audio content metadata", async () => {
    const { AudioContent, Metadata } = db.getModels();

    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    expect(await audioContent.countMetadatas()).toEqual(0);

    const metadata = await Metadata.create({ value: "metadata" });
    await audioContent.addMetadata(metadata);

    expect(await audioContent.countMetadatas()).toEqual(1);
  });

  it("should remove a certain metadata", async () => {
    const { AudioContent, Metadata } = db.getModels();
    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const metadata = await Metadata.create({ value: "metadata" });

    await audioContent.addMetadata(metadata);
    expect(await audioContent.hasMetadata(metadata)).toBeTruthy();

    await audioContent.removeMetadata(metadata);
    expect(await audioContent.hasMetadata(metadata)).toBeFalsy();
  });

  it("should return true when audio content has a certain series of metadatas", async () => {
    const { AudioContent, Metadata } = db.getModels();
    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const metadata1 = await Metadata.create({ value: "voice_metadata" });
    const metadata2 = await Metadata.create({ value: "type_metadata" });
    const metadata3 = await Metadata.create({ value: "format_metadata" });

    await audioContent.setMetadatas([metadata1, metadata2, metadata3]);

    expect(await audioContent.countMetadatas()).toEqual(3);
    expect(await audioContent.hasMetadatas(
      [metadata1, metadata2, metadata3]
    )).toBeTruthy();
    expect(await audioContent.hasMetadatas(
      [metadata1.id, metadata2.id, metadata3.id]
    )).toBeTruthy();
  });

  it("should not fail when trying to remove an metadata that the audio content does not have", async () => {
    const { AudioContent, Metadata } = db.getModels();
    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const metadata1 = await Metadata.create({ value: "voice_metadata" });
    const metadata2 = await Metadata.create({ value: "type_metadata" });
    const metadata3 = await Metadata.create({ value: "format_metadata" });

    await audioContent.addMetadatas([metadata1, metadata2]);
    expect(await audioContent.countMetadatas()).toEqual(2);

    await audioContent.removeMetadata(metadata3);
    expect(await audioContent.countMetadatas()).toEqual(2);

    await audioContent.removeMetadata(metadata2);
    expect(await audioContent.countMetadatas()).toEqual(1);
  });
});
