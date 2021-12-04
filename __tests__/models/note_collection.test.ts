import { Sequelize } from "sequelize";
import { generateBelongsToAssociationMethods, generateHasManyAssociationMethods, getAllMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("NoteCollection model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { MediaItem, NoteCollection } = db.getModels();

    await NoteCollection.destroy({ truncate: true });
    await MediaItem.destroy({ truncate: true });
  });

  it("should create a basic NoteCollection entry", async () => {
    const { NoteCollection } = db.getModels();

    const collection = await NoteCollection.create({
      name: "Collection 1"
    });

    expect(collection.name).toEqual("Collection 1");
    expect(collection.description).toBeUndefined();
    expect(await NoteCollection.count()).toEqual(1);
  });

  it("should create a basic NoteCollection entry with a description", async () => {
    const { NoteCollection } = db.getModels();

    const collection = await NoteCollection.create({
      name: "Collection 1",
      description: "This is a collection"
    });

    expect(collection.name).toEqual("Collection 1");
    expect(collection.description).toEqual("This is a collection");
    expect(await NoteCollection.count()).toEqual(1);
  });

  it("should association a NoteCollection to a MediaItem", async () => {
    const { MediaItem, NoteCollection } = db.getModels();

    const collection = await NoteCollection.create({
      name: "Collection 1"
    });

    const mediaItem = await MediaItem.create({
      title: "test",
    });

    expect(await collection.countMediaItems()).toEqual(0);

    await collection.addMediaItem(mediaItem);
    expect(await collection.countMediaItems()).toEqual(1);

    const mediaItems = await collection.getMediaItems();
    expect(mediaItems.length).toEqual(1);
    expect(mediaItems[0].id).toEqual(mediaItem.id);
  });

  it("should have automatically generated association methods for the MediaItem model", async () => {
    const { NoteCollection } = db.getModels();
    const noteCollection = await NoteCollection.create({ name: "test" });

    const expectedMethods = generateHasManyAssociationMethods("MediaItem");
    const availableMethods = getAllMethods(noteCollection);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the NoteCollection model", async () => {
    const { NoteCollection } = db.getModels();
    const noteCollection = await NoteCollection.create({ name: "test" });

    const expectedMethods = generateBelongsToAssociationMethods("User");
    const availableMethods = getAllMethods(noteCollection);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
