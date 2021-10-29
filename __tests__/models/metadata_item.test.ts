import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("Metadata model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { MetadataItem, MediaItem, AudioContent } = db.getModels();

    await MetadataItem.destroy({ truncate: true });
    await MediaItem.destroy({ truncate: true });
    await AudioContent.destroy({ truncate: true });
  });

  it("should create new metadata", async () => {
    const { MetadataItem } = db.getModels();

    const value = "type_metadata";
    const metadata = await MetadataItem.build({
      value,
    }).save();

    expect(metadata.value).toEqual(value);

    expect(metadata.id).toBeDefined();
    expect(metadata.createdAt).toBeDefined();
    expect(metadata.updatedAt).toBeDefined();

    expect(metadata.createdAt).toEqual(metadata.updatedAt);
  });

  it("should create new metdata with type, value, rou and time", async () => {
    const { MetadataItem } = db.getModels();

    const attributes = {
      value: "metadata",
      metadata_type: "type_metatadata",
      roi: "roi",
      time_interval: "50",
    };
    const metadata = await MetadataItem.create({
      value: attributes.value,
      metadata_type: attributes.metadata_type,
      roi: attributes.roi,
      time_interval: attributes.time_interval,
    });

    expect(metadata.id).toBeDefined();
    expect(metadata.createdAt).toBeDefined();
    expect(metadata.updatedAt).toBeDefined();
    expect(metadata.value).toBeDefined();
    expect(metadata.metadata_type).toBeDefined();
    expect(metadata.roi).toBeDefined();
    expect(metadata.time_interval).toBeDefined();

    expect(metadata.value).toEqual(attributes.value);
    expect(metadata.metadata_type).toEqual(attributes.metadata_type);
    expect(metadata.roi).toEqual(attributes.roi);
    expect(metadata.time_interval).toEqual(attributes.time_interval);
  });

  it("should add metadata to multimedia", async () => {
    const { MetadataItem, MediaItem } = db.getModels();
    const metadata = await MetadataItem.create({ value: "metadata" });
    const multimedia = await MediaItem.create({ title: "multimedia" });

    await metadata.setMediaItem(multimedia);
    const multimediaSaved = await metadata.getMediaItem();

    expect(multimediaSaved.id).toEqual(multimedia.id);
  });

  it("should add metadata to audio content", async () => {
    const { MetadataItem, AudioContent } = db.getModels();
    const metadata = await MetadataItem.create({ value: "metadata" });
    const audioContent = await AudioContent.create({ file: "audio.mp3" });

    await metadata.setAudioContent(audioContent);
    const audioContentSaved = await metadata.getAudioContent();

    expect(audioContentSaved.id).toEqual(audioContent.id);
  });

});
