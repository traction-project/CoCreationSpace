import { Sequelize } from "sequelize";
import { generateBelongsToAssociationMethods, generateHasManyAssociationMethods, getAllMethods } from "../../util";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("MediaItem model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { AsyncJob, MediaItem, EmojiReaction } = db.getModels();

    await MediaItem.destroy({ truncate: true });
    await EmojiReaction.destroy({ truncate: true });
    await AsyncJob.destroy({ truncate: true });
  });

  it("should create a multimedia entry with a array for the field 'resolutions'", async () => {
    const { MediaItem } = db.getModels();

    const mediaItem = await MediaItem.build({
      title: "test",
      resolutions: [240, 360, 720]
    }).save();

    expect(mediaItem.id).toBeDefined();
    expect(mediaItem.resolutions).toBeDefined();
    expect(mediaItem.resolutions).toEqual([240, 360, 720]);
  });

  it("should create a multimedia entry with a array for the field 'thumbnails'", async () => {
    const { MediaItem } = db.getModels();

    const mediaItem = await MediaItem.build({
      title: "test",
      thumbnails: ["thumbnail1", "thumbnail2", "thumbnail3"]
    }).save();

    expect(mediaItem.id).toBeDefined();
    expect(mediaItem.thumbnails).toBeDefined();
    expect(mediaItem.thumbnails).toEqual(
      ["thumbnail1", "thumbnail2", "thumbnail3"]
    );
  });

  it("should return all subtitles for a video", async () => {
    const { MediaItem, Subtitle } = db.getModels();

    const mediaItem = await MediaItem.create({
      title: "test",
    });

    const sub1 = await Subtitle.create({
      language: "de",
      content: "WEBVTT"
    });
    const sub2 = await Subtitle.create({
      language: "nl",
      content: "WEBVTT"
    });

    await mediaItem.setSubtitles([sub1, sub2]);
    expect(await mediaItem.countSubtitles()).toEqual(2);
  });

  it("should return all subtitles for a video with the given language", async () => {
    const { MediaItem, Subtitle } = db.getModels();

    const mediaItem = await MediaItem.create({
      title: "test",
    });

    const sub1 = await Subtitle.create({
      language: "de",
      content: "WEBVTT"
    });
    const sub2 = await Subtitle.create({
      language: "nl",
      content: "WEBVTT"
    });
    const sub3 = await Subtitle.create({
      language: "nl",
      content: "WEBVTT"
    });

    await mediaItem.setSubtitles([sub1, sub2, sub3]);

    expect((await mediaItem.getSubtitles({ where: { language: "de" } })).length).toEqual(1);
    expect(await mediaItem.getSubtitles({ where: { language: "es" } })).toEqual([]);
  });

  it("should initialise view count to zero", async () => {
    const { MediaItem } = db.getModels();

    const mediaItem = await MediaItem.create({
      title: "test",
    });

    expect(mediaItem.viewCount).toBeDefined();
    expect(mediaItem.viewCount).toEqual(0);
  });

  it("should increment the view count by one after calling incrementViewCount()", async () => {
    const { MediaItem } = db.getModels();

    const mediaItem = await MediaItem.create({
      title: "test",
    });

    expect(mediaItem.viewCount).toBeDefined();
    expect(mediaItem.viewCount).toEqual(0);

    await mediaItem.incrementViewCount();

    expect(mediaItem.viewCount).toEqual(1);
  });

  it("should list interactions with multimedia items by users", async () => {
    const { MediaItem, MultimediaInteraction } = db.getModels();

    const video = await MediaItem.create({
      title: "video",
    });

    expect(await video.countMultimediaInteractions()).toEqual(0);

    const interaction = await MultimediaInteraction.create({
      interaction: { type: "play", timestamp: 1 }
    });

    await interaction.setMediaItem(video);

    expect(await video.countMultimediaInteractions()).toEqual(1);
    expect(await video.hasMultimediaInteraction(interaction)).toBeTruthy();
  });

  it("should list async-jobs associated to the multimedia item", async () => {
    const { MediaItem, AsyncJob } = db.getModels();

    const video = await MediaItem.create({
      title: "video",
    });

    const job = await AsyncJob.create({
      type: "transcode_dash",
      jobId: "some_job_id"
    });

    expect(await video.countAsyncJobs()).toEqual(0);
    await video.addAsyncJob(job);

    expect(await video.countAsyncJobs()).toEqual(1);
    expect(await video.hasAsyncJob(job)).toBeTruthy();
  });

  it("should return whether an associated job is still processing", async () => {
    const { MediaItem, AsyncJob } = db.getModels();

    const video = await MediaItem.create({
      title: "video",
    });

    const job = await AsyncJob.create({
      type: "transcode_dash",
      jobId: "some_job_id"
    });

    video.addAsyncJob(job);
    expect(await video.isDoneTranscoding()).toBeFalsy();

    job.status = "done";
    await job.save();

    expect(await video.isDoneTranscoding()).toBeTruthy();
  });

  it("should return true when all associated job is still processing", async () => {
    const { MediaItem, AsyncJob } = db.getModels();

    const video = await MediaItem.create({
      title: "video",
    });

    const job1 = await AsyncJob.create({
      type: "transcode_dash",
      jobId: "some_job_id"
    });

    const job2 = await AsyncJob.create({
      type: "transcode_dash",
      jobId: "some_other_job_id"
    });

    video.addAsyncJobs([job1, job2]);

    expect(await video.isDoneTranscoding()).toBeFalsy();

    job1.status = "done";
    await job1.save();

    expect(await video.isDoneTranscoding()).toBeFalsy();

    job2.status = "done";
    await job2.save();

    expect(await video.isDoneTranscoding()).toBeTruthy();

    job2.status = "processing";
    await job2.save();

    expect(await video.isDoneTranscoding()).toBeFalsy();

    job2.status = "error";
    await job2.save();

    expect(await video.isDoneTranscoding()).toBeTruthy();
  });

  it("should list emoji-reactions associated to the multimedia item", async () => {
    const { MediaItem, EmojiReaction, User } = db.getModels();

    const video = await MediaItem.create({
      title: "video",
    });

    expect(await video.countEmojiReactions()).toEqual(0);

    const user = await User.create({ username: "admin" });
    const reaction = await EmojiReaction.create({
      emoji: "😋",
      userId: user.id,
      mediaItemId: video.id,
      second: 12.345
    });

    expect(await video.countEmojiReactions()).toEqual(1);
    const associatedReactions = await video.getEmojiReactions();

    expect(associatedReactions.length).toEqual(1);
    expect(associatedReactions[0].id).toEqual(reaction.id);
  });

  it("should have automatically generated association methods for the DataContainer model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateBelongsToAssociationMethods("DataContainer");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the User model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateBelongsToAssociationMethods("User");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the Subtitle model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("Subtitle");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the AudioContent model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("AudioContent");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the EmojiReaction model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("EmojiReaction");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the MetadataItem model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("MetadataItem");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the AsyncJob model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("AsyncJob");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the NoteCollection model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("NoteCollection");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });

  it("should have automatically generated association methods for the VideoChapter model", async () => {
    const { MediaItem } = db.getModels();
    const mediaItem = await MediaItem.create({ title: "test" });

    const expectedMethods = generateHasManyAssociationMethods("VideoChapter");
    const availableMethods = getAllMethods(mediaItem);

    for (const method of expectedMethods) {
      expect(availableMethods).toContain(method);
    }
  });
});
