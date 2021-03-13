import { Router } from "express";
import Busboy from "busboy";
import { v4 as uuid4 } from "uuid";
import sharp from "sharp";

import { db } from "../models";
import { getExtension, getFromEnvironment, streamToBuffer } from "../util";
import { authRequired } from "../util/middleware";
import { encodeDash, encodeAudio, encodeHLS, encodeHLSAudio } from "../util/transcode";
import { uploadToS3 } from "../util/s3";
import { transcribeMediaFile } from "../util/transcribe";
import { MultimediaInstance } from "../models/multimedia";
import { UserInstance } from "../models/users";
import { AsyncJobInstance } from "models/async_job";

const [ BUCKET_NAME, ETS_PIPELINE, CLOUDFRONT_URL ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE", "CLOUDFRONT_URL");
const router = Router();

const processUploadedVideo = async (file: NodeJS.ReadableStream, filename: string, userId: string) => {
  const { Multimedia, AsyncJob } = db.getModels();

  const newName = uuid4() + getExtension(filename);
  await uploadToS3(newName, file, BUCKET_NAME);

  transcribeMediaFile("en-US", newName, BUCKET_NAME);
  const dashJobId = await encodeDash(ETS_PIPELINE, newName);
  const hlsJobId = await encodeHLS(ETS_PIPELINE, newName);

  const video: MultimediaInstance = Multimedia.build();

  video.title = newName;
  video.key = newName.split(".")[0];
  video.type = "video";

  let jobs: Array<AsyncJobInstance> = [];

  if (dashJobId && hlsJobId) {
    jobs = await AsyncJob.bulkCreate([
      { type: "transcode_dash", jobId: dashJobId },
      { type: "transcode_hls", jobId: hlsJobId },
      { type: "transcribe", jobId: newName.split(".")[0] }
    ]);

    video.status = "processing";
  } else {
    video.status = "error";
  }

  await video.save();
  await video.setUser(userId);
  await video.setAsyncJobs(jobs);

  return video.id;
};

const processUploadedAudio = async (file: NodeJS.ReadableStream, filename: string, userId: string) => {
  const { AsyncJob, Multimedia } = db.getModels();

  const newName = uuid4() + getExtension(filename);
  await uploadToS3(newName, file, BUCKET_NAME);

  transcribeMediaFile("en-US", newName, BUCKET_NAME);
  const dashJobId = await encodeAudio(ETS_PIPELINE, newName);
  const hlsJobId = await encodeHLSAudio(ETS_PIPELINE, newName);

  const audio: MultimediaInstance = Multimedia.build();

  audio.title = newName;
  audio.key = newName.split(".")[0];
  audio.type = "audio";

  let jobs: Array<AsyncJobInstance> = [];

  if (dashJobId && hlsJobId) {
    jobs = await AsyncJob.bulkCreate([
      { type: "transcode_dash", jobId: dashJobId },
      { type: "transcode_hls", jobId: hlsJobId },
      { type: "transcribe", jobId: newName.split(".")[0] }
    ]);

    audio.status = "processing";
  } else {
    audio.status = "error";
  }

  await audio.save();
  await audio.setUser(userId);
  await audio.setAsyncJobs(jobs);

  return audio.id;
};

const processUploadedImage = async (file: NodeJS.ReadableStream, filename: string, userId: string) => {
  const { Multimedia } = db.getModels();

  // Get file stream buffer
  const bufferFile = await streamToBuffer(file);

  // Upload image to S3
  const newName = uuid4() + getExtension(filename);
  await uploadToS3(newName, bufferFile, BUCKET_NAME);

  // Generate thumbnail.
  // Set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
  const resizerImageBuffer = await sharp(bufferFile).resize(300).toBuffer();

  // Upload thumbnail to S3.
  const thumbnailName = uuid4() + getExtension(filename);
  await uploadToS3(thumbnailName, resizerImageBuffer, BUCKET_NAME);

  const image: MultimediaInstance = Multimedia.build();

  image.title = newName;
  image.status = "done";
  image.type = "image";
  if (image.thumbnails && image.thumbnails.length > 0) {
    image.thumbnails?.push(thumbnailName);
  } else {
    image.thumbnails = [thumbnailName];
  }

  await image.save();
  image.setUser(userId);

  return image.id;
};

const processUploadedFile = async (stream: NodeJS.ReadableStream, filename: string, userId: string) => {
  const { Multimedia } = db.getModels();

  const newName = uuid4() + getExtension(filename);
  await uploadToS3(newName, stream, BUCKET_NAME);

  const file: MultimediaInstance = Multimedia.build();

  file.title = newName;
  file.key = newName.split(".")[0];
  file.type = "file";
  file.status = "done";

  await file.save();
  await file.setUser(userId);

  return file.id;
};

router.post("/upload", authRequired, (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  const user = req.user as UserInstance;

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    try {
      if (mimetype.startsWith("video")) {
        const videoId = await processUploadedVideo(
          file, filename, user.id
        );

        res.send({
          status: "OK",
          id: videoId,
          type: "video"
        });
      } else if (mimetype.startsWith("audio")) {
        const audioId = await processUploadedAudio(
          file, filename, user.id
        );

        res.send({
          status: "OK",
          id: audioId,
          type: "audio"
        });
      } else if (mimetype.startsWith("image")) {
        const imageId = await processUploadedImage(
          file, filename, user.id
        );

        res.send({
          status: "OK",
          id: imageId,
          type: "image"
        });
      } else {
        res.status(400).send({
          status: "ERR",
          message: `Unsupported MIME type ${mimetype}`
        });
      }
    } catch (e) {
      console.error(e);

      res.status(500).send({
        status: "ERR",
        message: "Could not upload to S3"
      });
    }
  });

  req.pipe(busboy);
});

router.get("/all", async (req, res) => {
  const { Multimedia } = db.getModels();
  const videos = await Multimedia.findAll({ order: [["created_at", "desc"]] });

  res.send(videos.map((video) => {
    const mainThumbnail = video.thumbnails?.[0];

    return {
      id: video.id,
      title: video.title,
      duration: video.duration,
      resolutions: video.resolutions,
      mainThumbnail: (mainThumbnail) ? `${CLOUDFRONT_URL!}/transcoded/${mainThumbnail}` : undefined,
      status: video.status,
      key: video.key
    };
  }));
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { Multimedia } = db.getModels();
  const video = await Multimedia.findByPk(id);

  if (video) {
    return res.send({
      title: video.title,
      key: video.key,
      manifest: `${CLOUDFRONT_URL!}/transcoded/${video.key}.mpd`
    });
  } else {
    res.status(404).send("");
  }
});

router.get("/:id/thumbnail", async (req, res) => {
  const { id } = req.params;

  const { Multimedia } = db.getModels();
  const video = await Multimedia.findByPk(id);

  if (video && video.thumbnails) {
    return res.send({
      thumbnail: `${CLOUDFRONT_URL}/transcoded/${video.thumbnails[0]}`
    });
  }

  return res.status(404).send({
    status: "ERR",
    message: "No thumbnail found"
  });
});

/**
 * Add an emoji reaction to the given media item from the current user
 */
router.post("/:id/reaction", authRequired, async (req, res) => {
  const { Multimedia, EmojiReactions } = db.getModels();

  const { id } = req.params;
  const user = req.user as UserInstance;

  const mediaItem = await Multimedia.findByPk(id);

  if (mediaItem && user && user.id) {
    const { emoji, second } = req.body;

    const reaction = await EmojiReactions.create({
      emoji,
      second,
      multimedia_id: id,
      user_id: user.id
    });

    return res.send(reaction);
  } else {
    return res.status(400).send({
      message: "Media item not found"
    });
  }
});

router.post("/:id/view", async (req, res) => {
  const { id } = req.params;
  const { Multimedia } = db.getModels();

  const mediaItem = await Multimedia.findByPk(id);

  if (mediaItem) {
    await mediaItem.incrementViewCount();

    res.send({
      status: "OK"
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "Media item not found"
    });
  }
});

router.get("/:id/views", async (req, res) => {
  const { id } = req.params;
  const { Multimedia } = db.getModels();

  const mediaItem = await Multimedia.findByPk(id);

  if (mediaItem) {
    res.send({
      views: mediaItem.viewCount
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "Media item not found"
    });
  }
});

router.post("/:id/interaction", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;
  const { Multimedia, MultimediaInteraction } = db.getModels();

  const mediaItem = await Multimedia.findByPk(id);

  if (mediaItem) {
    const interaction = await MultimediaInteraction.create({
      interaction: req.body
    });

    await interaction.setMultimedium(mediaItem);
    await interaction.setUser(user);

    res.send({
      status: "OK"
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "Media item not found"
    });
  }
});

router.get("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { Multimedia } = db.getModels();

  const video = await Multimedia.findByPk(id);

  if (video) {
    return res.send({
      status: video.status
    });
  } else {
    return res.status(404).send("Video not found");
  }
});

router.get("/:id/subtitles", async (req, res) => {
  const { id } = req.params;

  const { Multimedia } = db.getModels();
  const video = await Multimedia.findByPk(id);

  if (video) {
    const subtitles = await video.getSubtitles();

    res.json(subtitles.map((s) => {
      return {
        id: s.id,
        language: s.language
      };
    }));
  } else {
    res.json([]);
  }
});

router.get("/subtitles/:id", async (req, res) => {
  const { id } = req.params;

  const { Subtitles } = db.getModels();
  const subtitle = await Subtitles.findByPk(id);

  if (subtitle) {
    res.send(subtitle.content);
  } else {
    res.send("");
  }
});

export default router;
