import { Router } from "express";
import * as Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import { db } from "../models";
import { getExtension, getFromEnvironment, authRequired } from "../util";
import { encodeDash } from "../util/transcode";
import { uploadToS3 } from "../util/s3";
import { transcribeMediaFile } from "../util/transcribe";
import { MultimediaInstance } from "../models/multimedia";
import { UserInstance } from "../models/users";

const [ BUCKET_NAME, ETS_PIPELINE, CLOUDFRONT_URL ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE", "CLOUDFRONT_URL");
const router = Router();

router.post("/upload", authRequired, (req, res) => {
  const Multimedia = db.getModels().Multimedia;
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    try {
      const newName = uuid4() + getExtension(filename);
      await uploadToS3(newName, file, BUCKET_NAME);

      transcribeMediaFile("en-US", newName, BUCKET_NAME);
      const jobId = await encodeDash(ETS_PIPELINE, newName);

      const userId: string | undefined = (req.user as UserInstance).id;

      let video: MultimediaInstance = Multimedia.build();

      video.title = filename;
      video.key = newName.split(".")[0];

      if (jobId) {
        video.transcodingJobId = jobId;
        video.transcriptionJobId = newName.split(".")[0];
        video.status = "processing";
      } else {
        video.status = "error";
      }

      await video.save();
      video.setUser(userId);

      res.send({ status: "OK", id: video.id });
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
  const Multimedia = db.getModels().Multimedia;
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

router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  const Multimedia = db.getModels().Multimedia;
  const video = await Multimedia.findOne({ where: { id } });

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

router.get("/id/:id/subtitles", async (req, res) => {
  const { id } = req.params;

  const { Multimedia } = db.getModels();
  const video = await Multimedia.findOne({ where: { id } });

  if (video) {
    const subtitles = await video.getSubtitle();

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
  const subtitle = await Subtitles.findOne({ where: { id } });

  if (subtitle) {
    res.send(subtitle.content);
  } else {
    res.send("");
  }
});

export default router;
