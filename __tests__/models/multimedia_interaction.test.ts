import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("MultimediaInteraction model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { MultimediaInteraction } = db.getModels();
    await MultimediaInteraction.destroy({ truncate: true });
  });

  it("should create a new empty instance", async () => {
    const { MultimediaInteraction } = db.getModels();

    const interaction = await MultimediaInteraction.create({
      interaction: { type: "play", timestamp: 0 }
    });

    expect(interaction.id).toBeDefined();
    expect(interaction.createdAt).toBeDefined();
    expect(interaction.updatedAt).toBeDefined();

    expect(interaction.createdAt).toEqual(interaction.updatedAt);

    expect(await interaction.getUser()).toBeNull();
    expect(await interaction.getMultimedium()).toBeNull();
  });

  it("should create a new empty instance and associate it to a user", async () => {
    const { MultimediaInteraction, Users } = db.getModels();

    const interaction = await MultimediaInteraction.create({
      interaction: { type: "play", timestamp: 0 }
    });

    const user = await Users.create({
      username: "admin"
    });

    expect(await interaction.getUser()).toBeNull();

    await interaction.setUser(user);
    expect(await interaction.getUser()).not.toBeNull();
  });

  it("should create a new empty instance and associate it to a multimedia item", async () => {
    const { MultimediaInteraction, Multimedia } = db.getModels();

    const interaction = await MultimediaInteraction.create({
      interaction: { type: "play", timestamp: 0 }
    });

    const video = await Multimedia.create({
      title: "video"
    });

    expect(await interaction.getUser()).toBeNull();

    await interaction.setMultimedium(video);
    expect(await interaction.getMultimedium()).not.toBeNull();
  });
});
