import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Audio Content model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { AudioContent, MediaItem, MetadataItem } = db.getModels();

    await AudioContent.destroy({ truncate: true });
    await MediaItem.destroy({ truncate: true });
    await MetadataItem.destroy({ truncate: true });
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
    const { AudioContent, MediaItem } = db.getModels();
    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const multimedia = await MediaItem.create({ title: "multimedia" });

    await audioContent.setMediaItem(multimedia);
    const multimediaSaved = await audioContent.getMediaItem();

    expect(multimediaSaved.title).toEqual(multimedia.title);
  });

  it("should return true when audio content has a certain metadata", async () => {
    const { AudioContent, MetadataItem } = db.getModels();

    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const metadata = await MetadataItem.create({ value: "metadata" });
    expect(await audioContent.hasMetadataItem(metadata)).toBeFalsy();

    await audioContent.addMetadataItem(metadata);
    expect(await audioContent.hasMetadataItem(metadata)).toBeTruthy();
  });

  it("should count a audio content metadata", async () => {
    const { AudioContent, MetadataItem } = db.getModels();

    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    expect(await audioContent.countMetadataItems()).toEqual(0);

    const metadata = await MetadataItem.create({ value: "metadata" });
    await audioContent.addMetadataItem(metadata);

    expect(await audioContent.countMetadataItems()).toEqual(1);
  });

  it("should remove a certain metadata", async () => {
    const { AudioContent, MetadataItem } = db.getModels();
    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const metadata = await MetadataItem.create({ value: "metadata" });

    await audioContent.addMetadataItem(metadata);
    expect(await audioContent.hasMetadataItem(metadata)).toBeTruthy();

    await audioContent.removeMetadataItem(metadata);
    expect(await audioContent.hasMetadataItem(metadata)).toBeFalsy();
  });

  it("should return true when audio content has a certain series of metadatas", async () => {
    const { AudioContent, MetadataItem } = db.getModels();
    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const metadata1 = await MetadataItem.create({ value: "voice_metadata" });
    const metadata2 = await MetadataItem.create({ value: "type_metadata" });
    const metadata3 = await MetadataItem.create({ value: "format_metadata" });

    await audioContent.setMetadataItems([metadata1, metadata2, metadata3]);

    expect(await audioContent.countMetadataItems()).toEqual(3);
    expect(await audioContent.hasMetadataItems(
      [metadata1, metadata2, metadata3]
    )).toBeTruthy();
    expect(await audioContent.hasMetadataItems(
      [metadata1.id, metadata2.id, metadata3.id]
    )).toBeTruthy();
  });

  it("should not fail when trying to remove an metadata that the audio content does not have", async () => {
    const { AudioContent, MetadataItem } = db.getModels();
    const audioContent = await AudioContent.create({ file: "audio.mp3" });
    const metadata1 = await MetadataItem.create({ value: "voice_metadata" });
    const metadata2 = await MetadataItem.create({ value: "type_metadata" });
    const metadata3 = await MetadataItem.create({ value: "format_metadata" });

    await audioContent.addMetadataItems([metadata1, metadata2]);
    expect(await audioContent.countMetadataItems()).toEqual(2);

    await audioContent.removeMetadataItem(metadata3);
    expect(await audioContent.countMetadataItems()).toEqual(2);

    await audioContent.removeMetadataItem(metadata2);
    expect(await audioContent.countMetadataItems()).toEqual(1);
  });
});
