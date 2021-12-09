import { Router } from "express";
import Busboy from "busboy";
import { v4 as uuid4 } from "uuid";
import sharp from "sharp";

import { db } from "../models";
import { getExtension, getFromEnvironment, performOCR, streamToBuffer } from "../util";
import { authRequired } from "../util/middleware";
import { encodeDash, encodeAudio, encodeHLS, encodeHLSAudio } from "../util/transcode";
import { uploadToS3 } from "../util/s3";
import { transcribeMediaFile } from "../util/transcribe";
import { MediaItemInstance } from "../models/media_item";
import { UserInstance } from "../models/user";
import { AsyncJobInstance } from "models/async_job";

const [ BUCKET_NAME, ETS_PIPELINE, CLOUDFRONT_URL ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE", "CLOUDFRONT_URL");

async function uploadStreamingFile(type: "audio" | "video", file: NodeJS.ReadableStream, filename: string) {
  await uploadToS3(filename, file, BUCKET_NAME);

  transcribeMediaFile(filename, BUCKET_NAME);
  let dashJobId: string | undefined, hlsJobId: string | undefined;

  if (type == "video") {
    dashJobId = await encodeDash(ETS_PIPELINE, filename);
    hlsJobId = await encodeHLS(ETS_PIPELINE, filename);
  } else {
    dashJobId = await encodeAudio(ETS_PIPELINE, filename);
    hlsJobId = await encodeHLSAudio(ETS_PIPELINE, filename);
  }

  return [dashJobId, hlsJobId];
}

async function processAndUploadStreamingFile(type: "audio" | "video", file: NodeJS.ReadableStream, originalFilename: string, userId: string): Promise<string> {
  const { MediaItem, AsyncJob } = db.getModels();

  const newName = uuid4() + getExtension(originalFilename);
  const [ dashJobId, hlsJobId ] = await uploadStreamingFile(type, file, newName);

  const mediaItem = MediaItem.build();

  mediaItem.title = newName;
  mediaItem.file = originalFilename;
  mediaItem.key = newName.split(".")[0];
  mediaItem.type = type;

  let jobs: Array<AsyncJobInstance> = [];

  if (dashJobId && hlsJobId) {
    jobs = await AsyncJob.bulkCreate([
      { type: "transcode_dash", jobId: dashJobId },
      { type: "transcode_hls", jobId: hlsJobId },
      { type: "transcribe", jobId: newName.split(".")[0] }
    ]);

    mediaItem.status = "processing";
  } else {
    mediaItem.status = "error";
  }

  await mediaItem.save();
  await mediaItem.setUser(userId);
  await mediaItem.setAsyncJobs(jobs);

  return mediaItem.id;
}

async function uploadImage(file: NodeJS.ReadableStream, filename: string, thumbnailName: string) {
  // Get file stream buffer
  const bufferFile = await streamToBuffer(file);
  await uploadToS3(filename, bufferFile, BUCKET_NAME);

  // Perform OCR on image
  const ocrResult = await performOCR(filename, BUCKET_NAME);

  // Generate thumbnail.
  // Set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
  const resizerImageBuffer = await sharp(bufferFile).resize(300).toBuffer();
  await uploadToS3(thumbnailName, resizerImageBuffer, BUCKET_NAME);

  return ocrResult;
}

async function processAndUploadImage(file: NodeJS.ReadableStream, originalFilename: string, userId: string): Promise<string> {
  const { MediaItem } = db.getModels();

  const newName = uuid4() + getExtension(originalFilename);
  const thumbnailName = uuid4() + getExtension(originalFilename);
  const ocrResult = await uploadImage(file, newName, thumbnailName);

  const image: MediaItemInstance = MediaItem.build();

  image.title = newName;
  image.file = originalFilename;
  image.status = "done";
  image.type = "image";
  image.ocrData = ocrResult;

  if (image.thumbnails && image.thumbnails.length > 0) {
    image.thumbnails?.push(thumbnailName);
  } else {
    image.thumbnails = [thumbnailName];
  }

  await image.save();
  image.setUser(userId);

  return image.id;
}

async function processAndUploadFile(stream: NodeJS.ReadableStream, filename: string, userId: string): Promise<string> {
  const { MediaItem } = db.getModels();

  const newName = uuid4() + getExtension(filename);
  await uploadToS3(newName, stream, BUCKET_NAME);

  const file: MediaItemInstance = MediaItem.build();

  file.title = newName;
  file.file = filename;
  file.key = newName.split(".")[0];
  file.type = "file";
  file.status = "done";

  await file.save();
  await file.setUser(userId);

  return file.id;
}

const router = Router();

/**
 * Handles uploaded files and prepares them for further processing depending
 * on the file's mime type.
 */
router.post("/upload", authRequired, (req, res) => {
  const busboy = new Busboy({ headers: req.headers });
  const user = req.user as UserInstance;

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    try {
      let type = mimetype.split("/")[0];
      let mediaItemId: string;

      if (type == "video" || type == "audio") {
        mediaItemId = await processAndUploadStreamingFile(
          type, file, filename, user.id
        );
      } else if (type == "image") {
        mediaItemId = await processAndUploadImage(
          file, filename, user.id
        );
      } else {
        type = "file";
        mediaItemId = await processAndUploadFile(
          file, filename, user.id
        );
      }

      res.send({
        status: "OK",
        id: mediaItemId,
        type
      });
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

/**
 * Replaces the contents of a previously uploaded file with the file submitted
 * in this request.
 */
router.post("/:id/replace", authRequired, async (req, res) => {
  const { id } = req.params;
  const { MediaItem } = db.getModels();

  const mediaItem = await MediaItem.findByPk(id);

  if (!mediaItem) {
    return res.status(400).send({
      status: "ERR",
      message: "No such media item"
    });
  }

  const busboy = new Busboy({ headers: req.headers });
  busboy.on("file", async (_, file) => {
    try {
      const existingFilename = mediaItem.title;
      const { type } = mediaItem;

      if (type == "video" || type == "audio") {
        await uploadStreamingFile(
          type, file, existingFilename
        );
      } else if (type == "image") {
        const thumbFilename = mediaItem.thumbnails![0];

        await uploadImage(
          file, existingFilename, thumbFilename
        );
      } else {
        await uploadToS3(existingFilename, file, BUCKET_NAME);
      }

      res.send({
        status: "OK",
        id: mediaItem.id,
        type
      });
    } catch (e) {
      console.error(e);

      res.status(500).send({
        status: "ERR",
        message: "Could not upload to S3"
      });
    }
  });
});

router.get("/all", async (req, res) => {
  const { MediaItem } = db.getModels();
  const videos = await MediaItem.findAll({ order: [["createdAt", "desc"]] });

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

  const { MediaItem } = db.getModels();
  const video = await MediaItem.findByPk(id);

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

/**
 * Retrieve the original filename for the media item with the given id.
 */
router.get("/:id/name", async (req, res) => {
  const { id } = req.params;

  const { MediaItem } = db.getModels();
  const mediaItem = await MediaItem.findByPk(id);

  if (mediaItem) {
    return res.send({
      originalName: mediaItem.file,
      downloadUrl: `${CLOUDFRONT_URL}/${mediaItem.title}`
    });
  } else {
    res.status(404).send("");
  }
});

router.get("/:id/thumbnail", async (req, res) => {
  const { id } = req.params;

  const { MediaItem } = db.getModels();
  const video = await MediaItem.findByPk(id);

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
  const { MediaItem, EmojiReaction } = db.getModels();

  const { id } = req.params;
  const user = req.user as UserInstance;

  const mediaItem = await MediaItem.findByPk(id);

  if (mediaItem && user && user.id) {
    const { emoji, second } = req.body;

    const reaction = await EmojiReaction.create({
      emoji,
      second,
      mediaItemId: id,
      userId: user.id
    });

    return res.send(reaction);
  } else {
    return res.status(400).send({
      message: "Media item not found"
    });
  }
});

/**
 * Increment the view count for a media item
 */
router.post("/:id/view", async (req, res) => {
  const { id } = req.params;
  const { MediaItem } = db.getModels();

  const mediaItem = await MediaItem.findByPk(id);

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

/**
 * Retrieve the view count for a media item
 */
router.get("/:id/views", async (req, res) => {
  const { id } = req.params;
  const { MediaItem } = db.getModels();

  const mediaItem = await MediaItem.findByPk(id);

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
  const { MediaItem, MultimediaInteraction } = db.getModels();

  const mediaItem = await MediaItem.findByPk(id);

  if (mediaItem) {
    const interaction = await MultimediaInteraction.create({
      interaction: req.body
    });

    await interaction.setMediaItem(mediaItem);
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

/**
 * Returns the current processing status of the media item with the given ID.
 */
router.get("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { MediaItem } = db.getModels();

  const video = await MediaItem.findByPk(id);

  if (video) {
    return res.send({
      status: video.status
    });
  } else {
    return res.status(404).send("Video not found");
  }
});

/**
 * Returns the list of chapters sorted ascendingly by starting time associated
 * with the media item with the given ID.
 */
router.get("/:id/chapters", async (req, res) => {
  const { id } = req.params;
  const { MediaItem } = db.getModels();

  const mediaItem = await MediaItem.findByPk(id);

  if (mediaItem) {
    return res.send({
      chapters: await mediaItem.getSortedChapters()
    });
  }

  return res.status(404).send({
    status: "ERR",
    message: "Media item not found"
  });
});

/**
 * Adds a new chapter to the media item identified by the given ID. The name
 * and start time for the chapter needs to be passed as JSON body. If either
 * param is missing, 400 is returned. If there is no media item with the given
 * ID, 404 is returned. Upon success the newly created chapter is returned.
 */
router.post("/:id/chapter", async (req, res) => {
  const { MediaItem, VideoChapter } = db.getModels();

  const { id } = req.params;
  const { name, startTime } = req.body;

  if (name == undefined || startTime == undefined) {
    return res.status(400).send({
      status: "ERR",
      message: "Missing parameters"
    });
  }

  const mediaItem = await MediaItem.findByPk(id);

  if (!mediaItem) {
    return res.status(404).send({
      status: "ERR",
      message: "Media item not found"
    });
  }

  const chapter = await VideoChapter.create({ name, startTime });
  await mediaItem.addVideoChapter(chapter);

  return res.send({
    chapter: chapter.toJSON()
  });
});

/**
 * Removes a chapter given by an ID from the media item identified by a given
 * ID. If there is no media item or chapter with the given ID, or the chapter
 * is not associated to the media item, 404 is returned.
 */
router.delete("/:mediaItemId/chapter/:chapterId", async (req, res) => {
  const { VideoChapter } = db.getModels();
  const { mediaItemId, chapterId } = req.params;

  const chapter = await VideoChapter.findOne({ where: {
    id: chapterId, mediaItemId
  }});

  if (!chapter) {
    return res.status(404).send({
      status: "ERR",
      message: "No chapter meeting the requirements found"
    });
  }

  await chapter.destroy();

  return res.send({
    status: "OK"
  });
});

/**
 * Retrieve available subtitles for the media item identified by the given ID.
 */
router.get("/:id/subtitles", async (req, res) => {
  const { id } = req.params;

  const { MediaItem } = db.getModels();
  const video = await MediaItem.findByPk(id);

  if (video) {
    const subtitles = await video.getSubtitles();

    res.json(subtitles.map((s) => {
      return {
        id: s.id,
        default: s.isDefault(),
        language: s.language
      };
    }));
  } else {
    res.json([]);
  }
});

/**
 * Retrieve the subtitles identified by the given ID.
 */
router.get("/subtitles/:id", async (req, res) => {
  const { id } = req.params;

  const { Subtitle } = db.getModels();
  const subtitle = await Subtitle.findByPk(id);

  if (subtitle) {
    res.send(subtitle.content);
  } else {
    res.send("");
  }
});

export default router;
