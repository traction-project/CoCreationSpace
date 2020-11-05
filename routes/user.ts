import { Router } from "express";
import Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import { getExtension, authRequired, getFromEnvironment } from "../util";
import { uploadToS3 } from "../util/s3";
import { UserInstance } from "models/users";
import { db } from "../models";

const [ BUCKET_NAME, CLOUDFRONT_URL ] = getFromEnvironment("BUCKET_NAME", "CLOUDFRONT_URL");
const router = Router();

/**
 * POST an image to the authenticated user that did the request
 */
router.post("/image", authRequired, (req, res) => {
  const user = req.user as UserInstance;
  const busboy = new Busboy({ headers: req.headers });

  busboy.on("file", async (fieldname, file, filename, encoding, mimetype) => {
    const newName = uuid4() + getExtension(filename);

    try {
      await uploadToS3(newName, file, BUCKET_NAME);
      user.image = newName;
      await user.save();
      const { id, username } = user;
      const image = `${CLOUDFRONT_URL}/${newName}`;
      return res.send({id, username, image});
    } catch (e) {
      console.error(e);
      res.status(500).send({
        status: "ERR",
        message: "Could not upload to S3"
      });
    }
  });

  return req.pipe(busboy);
});

/**
 * Get user information
 */
router.get("/profile", authRequired, (req, res) => {
  const { id, username, image } = req.user as UserInstance;

  return res.send({
    id, username,
    image: `${CLOUDFRONT_URL}/${image}`
  });
});

/**
 * Modify user account (username and password)
 */
router.put("/", authRequired, async (req, res) => {
  const { Users } = db.getModels();
  const user = req.user as UserInstance;
  const { body } = req;

  if (body.username && body.username != user.username) {
    const existUser = await Users.findOne({ where: { username: body.username }});

    if (!existUser) {
      const newUsername = body.username;

      if (user.username !== newUsername) {
        user.username = newUsername;

        try {
          await user.save();
        } catch (err) {
          res.status(500);

          return res.send({
            status: "ERR",
            message: err.message
          });
        }
      }
    } else {
      return res.status(400).send({ message: "The username already exists"});
    }
  }

  if (body.password && body.password.length > 0) {
    user.setPassword(body.password);

    try {
      await user.save();
    } catch(err) {
      res.status(500);

      return res.send({
        status: "ERR",
        message: err.message
      });
    }
  }

  if (body.preferredLanguage && body.preferredLanguage != user.preferredLanguage) {
    user.preferredLanguage = body.preferredLanguage;

    try {
      await user.save();
    } catch (err) {
      res.status(500);

      return res.send({
        status: "ERR",
        message: err.message
      });
    }
  }

  const { id, username, image, preferredLanguage } = user;

  res.send({
    id, username, preferredLanguage,
    image: `${CLOUDFRONT_URL}/${image}`
  });
});

router.get("/interests", authRequired, async (req, res) => {
  const user = req.user as UserInstance;

  return res.send({
    interests: await user.getInterestedTopics()
  });
});

router.post("/interests", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { body } = req;

  await user.addInterestedTopics(body.topics);

  return res.send({
    interests: await user.getInterestedTopics()
  });
});

export default router;
