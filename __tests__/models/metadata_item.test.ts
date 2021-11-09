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
      metadataType: "type_metatadata",
      roi: "roi",
      timeInterval: "50",
    };
    const metadata = await MetadataItem.create({
      value: attributes.value,
      metadataType: attributes.metadataType,
      roi: attributes.roi,
      timeInterval: attributes.timeInterval,
    });

    expect(metadata.id).toBeDefined();
    expect(metadata.createdAt).toBeDefined();
    expect(metadata.updatedAt).toBeDefined();
    expect(metadata.value).toBeDefined();
    expect(metadata.metadataType).toBeDefined();
    expect(metadata.roi).toBeDefined();
    expect(metadata.timeInterval).toBeDefined();

    expect(metadata.value).toEqual(attributes.value);
    expect(metadata.metadataType).toEqual(attributes.metadataType);
    expect(metadata.roi).toEqual(attributes.roi);
    expect(metadata.timeInterval).toEqual(attributes.timeInterval);
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
