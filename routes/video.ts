import { Router } from "express";
import * as Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import Video from "../models/video";
import { User } from "../models/user";
import { getExtension, getFromEnvironment, encodeDash, authRequired } from "../util";
import { uploadToS3 } from "../util/s3";
import { transcribeMediaFile } from "../util/transcribe";

const [ BUCKET_NAME, ETS_PIPELINE ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE");
const router = Router();

router.post("/upload", authRequired, (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    try {
      const newName = uuid4() + getExtension(filename);
      await uploadToS3(newName, file, BUCKET_NAME);

      transcribeMediaFile("en-US", newName);
      const jobId = await encodeDash(ETS_PIPELINE, newName);

      const userId: string = (req.user as User).id;

      const video = new Video();
      video.uploadedBy = userId;
      video.title = filename;

      if (jobId) {
        video.transcodingJobId = jobId;
        video.status = "processing";
      } else {
        video.status = "error";
      }

      await video.save();
      res.send({ status: "OK" });
    } catch {
      res.status(500).send({
        status: "ERR",
        message: "Could not upload to S3"
      });
    }
  });

  req.pipe(busboy);
});

export default router;
