import { Router } from "express";
import * as Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import Video from "../models/video";
import { getExtension, uploadToS3, getFromEnvironment, encodeDash, authRequired } from "../util";

const [ BUCKET_NAME, ETS_PIPELINE ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE");
const router = Router();

router.post("/upload", authRequired(), (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    try {
      const newName = uuid4() + getExtension(filename);

      await uploadToS3(newName, file, BUCKET_NAME);
      const jobId = await encodeDash(ETS_PIPELINE, newName);

      const video = new Video();
      // TODO get user id
      video.uploadedBy = "0";
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
