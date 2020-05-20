import { Router } from "express";
import * as Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import { getExtension, uploadToS3, getFromEnvironment } from "../util";

const [ BUCKET_NAME ] = getFromEnvironment("BUCKET_NAME");
const router = Router();

router.post("/upload", (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    try {
      const newName = uuid4() + getExtension(filename);
      await uploadToS3(newName, file, BUCKET_NAME);

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
