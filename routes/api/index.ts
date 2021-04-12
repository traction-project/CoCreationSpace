import { Router } from "express";
import passport from "passport";
import Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import { getExtension, getFromEnvironment } from "../../util";
import { tokenRequired, permissionRequired } from "../../util/middleware";
import { uploadToS3, deleteFromS3 } from "../../util/s3";
import { UserInstance } from "../../models/users";
import { encodeDash, getJobStatus } from "../../util/transcode";

const [ BUCKET_NAME, ETS_PIPELINE ] = getFromEnvironment("BUCKET_NAME", "ETS_PIPELINE");
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

router.post("/upload/raw", tokenRequired, permissionRequired("upload_raw"), (req, res) => {
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

/**
 * Starts a new DASH transcoding job for an existing raw input.
 * This route needs to be called with the `Content-Type` header of the request
 * being set to `application/json` and a JSON object containing the key `input`
 * needs to be provided in the request body. The value associated to the `input`
 * key should specify the path to an existing raw upload. If the request body
 * does not define a key `input`, an error 400 is returned.
 *
 * If the given input is a video file which does not have an audio stream, an
 * additional parameter named `hasAudio` set to `false` needs to be added to
 * the request body, otherwise the encoding will fail. If this `hasAudio`
 * parameter is missing, it is assumed to be `true`.
 *
 * The function then attempts to start a new transcoding job for the given
 * input and if successful returns a JSON object containing the key `jobId`,
 * with which the status of the transcoding job can be checked. If the
 * transcoding job could not be started an error 500 is returned.
 */
router.post("/upload/encode", tokenRequired, permissionRequired("upload_raw"), async (req, res) => {
  const { input, hasAudio } = req.body;

  if (!input) {
    return res.status(400).send({
      status: "ERR",
      message: "No input path specified"
    });
  }

  try {
    const jobId = await encodeDash(ETS_PIPELINE, input, hasAudio || true);

    res.send({
      status: "OK",
      jobId
    });
  } catch (e) {
    res.status(500).send({
      status: "ERR",
      message: e.message
    });
  }
});

/**
 * Tries to retrieve to transcoding job status of the job with the given ID.
 */
router.get("/upload/encode/status/:jobId", tokenRequired, permissionRequired("upload_raw"), async (req, res) => {
  const { jobId } = req.params;

  try {
    const status = await getJobStatus(jobId);

    res.send({
      status: "OK",
      jobStatus: status
    });
  } catch (e) {
    res.status(500).send({
      status: "ERR",
      message: e.message
    });
  }
});

router.delete("/upload/raw", tokenRequired, permissionRequired( "upload_raw"), async (req, res) => {
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
