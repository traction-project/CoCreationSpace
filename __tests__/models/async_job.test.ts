import { Sequelize } from "sequelize";

process.env["SESSION_SECRET"] = "sessionsecret";
const sequelize = new Sequelize("sqlite::memory:", { logging: false });

import { db } from "../../models";

describe("AsyncJob model", () => {
  beforeAll(async () => {
    await db.createDB(sequelize);
  });

  beforeEach(async () => {
    const { AsyncJob, MediaItem } = db.getModels();

    await AsyncJob.destroy({ truncate: true });
    await MediaItem.destroy({ truncate: true });
  });

  it("should create a new empty instance", async () => {
    const { AsyncJob } = db.getModels();

    const job = await AsyncJob.create({
      type: "transcode_dash",
      jobId: "some_job_id"
    });

    expect(job.id).toBeDefined();
    expect(job.createdAt).toBeDefined();
    expect(job.updatedAt).toBeDefined();

    expect(job.status).toBeDefined();
    expect(job.status).toEqual("processing");

    expect(await job.getMediaItem()).toBeNull();
  });

  it("should create a new empty instance and associate it to a media item", async () => {
    const { AsyncJob, MediaItem } = db.getModels();

    const job = await AsyncJob.create({
      type: "transcode_dash",
      jobId: "some_job_id"
    });

    const video = await MediaItem.create({
      title: "video"
    });

    expect(await job.getMediaItem()).toBeNull();

    await job.setMediaItem(video);
    expect(await job.getMediaItem()).not.toBeNull();
  });
});
