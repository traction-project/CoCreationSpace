import { Router } from "express";
import passport from "passport";
import Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import { getExtension, getFromEnvironment, tokenRequired } from "../../util";
import { uploadToS3, deleteFromS3 } from "../../util/s3";
import { UserInstance } from "../../models/users";

const [ BUCKET_NAME ] = getFromEnvironment("BUCKET_NAME");
const UPLOAD_PREFIX = "upload/";

const router = Router();

router.get("/", (_, res) => {
  res.send({
    status: "OK"
  });
});

router.post("/login", (req, res, next) => {
  const { username, password  } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      status: "ERR",
      message: "Insufficient parameters"
    });
  }

  return passport.authenticate("local", { session: false }, (err: Error | null, user: UserInstance | undefined, msg: { message: string }) => {
    if (err) {
      return next(err);
    }

    if (user) {
      return res.send(user.getAuth());
    }

    res.status(401).send({
      status: "ERR",
      ...msg
    });
  })(req, res, next);
});

router.get("/loginstatus", tokenRequired, (_, res) => {
  res.send({
    status: "OK"
  });
});

router.post("/upload/raw", tokenRequired, (req, res) => {
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", async (_, file, filename) => {
    try {
      const newName = UPLOAD_PREFIX + uuid4() + getExtension(filename);
      await uploadToS3(newName, file, BUCKET_NAME);

      res.send({
        status: "OK",
        name: newName
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

router.delete("/upload/raw", tokenRequired, async (req, res) => {
  const { key } = req.body;

  if (!key) {
    res.status(400).send({
      status: "ERR",
      message: "No key specified"
    });
  }

  try {
    await deleteFromS3(key, BUCKET_NAME);

    res.send({
      status: "OK"
    });
  } catch (e) {
    console.error(e);

    res.status(500).send({
      status: "ERR",
      message: "Could not delete from S3"
    });
  }
});

export default router;
