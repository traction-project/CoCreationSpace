import { Router } from "express";
import * as Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import Video from "../models/video";
import { User } from "../models/user";
import { getExtension, getFromEnvironment, encodeDash, authRequired } from "../util";
import { uploadToS3 } from "../util/s3";
import { transcribeMediaFile, transcribeOutputToVTT } from "../util/transcribe";

const [ BUCKET_NAME, ETS_PIPELINE, CLOUDFRONT_URL ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE", "CLOUDFRONT_URL");
const router = Router();

router.post("/upload", authRequired, (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    try {
      const newName = uuid4() + getExtension(filename);
      await uploadToS3(newName, file, BUCKET_NAME);

      transcribeMediaFile("en-US", newName, BUCKET_NAME);
      const jobId = await encodeDash(ETS_PIPELINE, newName);

      const userId: string = (req.user as User).id;

      const video = new Video();
      video.uploadedBy = userId;
      video.title = filename;
      video.key = newName.split(".")[0];

      if (jobId) {
        video.transcodingJobId = jobId;
        video.status = "processing";
      } else {
        video.status = "error";
      }

      await video.save();
      res.send({ status: "OK" });
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
  const videos = await Video.find({}).sort({ dateUpdated: -1 });

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
  const video = await Video.findById(id);

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
  const video = await Video.findById(id);

  if (video && video.transcript) {
    res.send(transcribeOutputToVTT(video.transcript));
  } else {
    res.send("");
  }
});

export default router;
