import { Router } from "express";
import * as Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import { getExtension, authRequired, getFromEnvironment } from "../util";
import { uploadToS3 } from "../util/s3";
import { UserInstance } from "models/users";

const [ BUCKET_NAME ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE", "CLOUDFRONT_URL");
const router = Router();

router.post("/image", authRequired, (req, res) => {
  const user = req.user as UserInstance;
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    const newName = uuid4() + getExtension(filename);

    try {
      await uploadToS3(newName, file, BUCKET_NAME);
      user.image = newName;
      await user.save();
      file.resume();
    } catch (e) {
      console.error(e);
      res.status(500).send({
        status: "ERR",
        message: "Could not upload to S3"
      });
    }
  });

  busboy.on("finish", () => {
    console.log("Upload complete");
    res.sendStatus(200);
  });

  return req.pipe(busboy);
});

export default router;