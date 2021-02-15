import { Router } from "express";
import Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import { db } from "../models";
import { getExtension, getFromEnvironment } from "../util";
import { authRequired } from "../util/middleware";
import { encodeDash } from "../util/transcode";
import { uploadToS3 } from "../util/s3";
import { transcribeMediaFile } from "../util/transcribe";
import { MultimediaInstance } from "../models/multimedia";
import { UserInstance } from "../models/users";

const [ BUCKET_NAME, ETS_PIPELINE, CLOUDFRONT_URL ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE", "CLOUDFRONT_URL");
const router = Router();

const processUploadedVideo = async (file: NodeJS.ReadableStream, filename: string, userId: string) => {
  const { Multimedia } = db.getModels();

  const newName = uuid4() + getExtension(filename);
  await uploadToS3(newName, file, BUCKET_NAME);

  transcribeMediaFile("en-US", newName, BUCKET_NAME);
  const jobId = await encodeDash(ETS_PIPELINE, newName);

  const video: MultimediaInstance = Multimedia.build();

  video.title = filename;
  video.key = newName.split(".")[0];
  video.type = "video";

  if (jobId) {
    video.transcodingJobId = jobId;
    video.transcriptionJobId = newName.split(".")[0];
    video.status = "processing";
  } else {
    video.status = "error";
  }

  await video.save();
  video.setUser(userId);

  return video.id;
};

const processUploadedAudio = async (file: NodeJS.ReadableStream, filename: string, userId: string) => {
  const { Multimedia } = db.getModels();

  const newName = uuid4() + getExtension(filename);
  await uploadToS3(newName, file, BUCKET_NAME);
  transcribeMediaFile("en-US", newName, BUCKET_NAME);

  const audio: MultimediaInstance = Multimedia.build();

  audio.title = newName;
  audio.transcriptionJobId = newName.split(".")[0];
  audio.status = "done";
  audio.type = "audio";

  await audio.save();
  audio.setUser(userId);

  return audio.id;
};

const processUploadedImage = async (file: NodeJS.ReadableStream, filename: string, userId: string) => {
  const { Multimedia } = db.getModels();

  const newName = uuid4() + getExtension(filename);
  await uploadToS3(newName, file, BUCKET_NAME);

  const image: MultimediaInstance = Multimedia.build();

  image.title = newName;
  image.status = "done";
  image.type = "image";

  await image.save();
  image.setUser(userId);

  return image.id;
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
