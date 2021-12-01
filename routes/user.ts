import { Router } from "express";
import Busboy from "busboy";
import { v4 as uuid4 } from "uuid";
import sharp from "sharp";

import { db } from "../models";
import { getExtension, getFromEnvironment, streamToBuffer } from "../util";
import { authRequired } from "../util/middleware";
import { uploadToS3 } from "../util/s3";
import { UserInstance } from "models/user";

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
      const bufferFile = await streamToBuffer(file);
      const resizedImageBuffer = await sharp(bufferFile).resize(300).toBuffer();

      await uploadToS3(newName, resizedImageBuffer, BUCKET_NAME);
      user.image = newName;

      await user.save();

      const { id, username } = user;
      const image = `${CLOUDFRONT_URL}/${newName}`;

      return res.send({
        id, username, image
      });
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
 * Get user information for current user
 */
router.get("/profile", authRequired, async (req, res) => {
  const user = req.user as UserInstance;

  const { id, username, image, email } = user;
  const admin = await user.isAdmin();

  return res.send({
    id, username,
    image: `${CLOUDFRONT_URL}/${image}`,
    email,
    admin
  });
});

/**
 * Modify user account (email, preferred language and password)
 */
router.put("/", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { body } = req;

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

  if (body.email && body.email.length > 0) {
    user.email = body.email;

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

/**
 * Submit consent/demographics form for given user
 */
router.post("/consent", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { ConsentForm } = db.getModels();

  const data = req.body;

  try {
    const consentForm = await ConsentForm.create({ data });
    await consentForm.setUser(user);

    res.send({
      status: "OK"
    });
  } catch {
    res.status(400).send({
      status: "ERR",
      message: "Cannot save consent form"
    });
  }
});

/**
 * Retrieve all topics that the current user is interested in.
 */
router.get("/interests", authRequired, async (req, res) => {
  const user = req.user as UserInstance;

  return res.send(
    await user.getInterestedTopics()
  );
});

/**
 * Add new topic interests to the current user. Data should be submitted as a
 * JSON object through the request body, containing a key `topics` which
 * specifies the ids of the topics that should be added as user interests.
 * Returns an updated list of interests for the current user.
 */
router.post("/interests", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { body } = req;

  await user.addInterestedTopics(body.topics);

  return res.send(
    await user.getInterestedTopics()
  );
});

/**
 * Deletes topic interests from the current user. Data should be submitted as a
 * JSON object through the request body, containing a key `topics` which
 * specifies the ids of the topics that should be removed from the user's
 * interests. Returns an updated list of interests for the current user.
 */
router.delete("/interests", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { body } = req;

  await user.removeInterestedTopics(body.topics);

  return res.send(
    await user.getInterestedTopics()
  );
});

/**
 * Get user information for given user ID
 */
router.get("/profile/:id", authRequired, async (req, res) => {
  const { User, DataContainer, MediaItem, Thread, Topic, Post } = db.getModels();
  const user = await User.findByPk(req.params.id);

  // Return 404 if no user with given ID is found
  if (!user) {
    return res.status(404).send({
      status: "ERR",
      message: "No such user"
    });
  }

  const { id, username, image } = user;

  // Retrieve posts for user
  const posts = await user.getPosts({
    order: [["createdAt", "DESC"]],
    include: [
      {
        model: DataContainer, include: [{
          model: MediaItem, attributes: ["id", "type"]
        }]
      },
      {
        model: Thread, include: [{
          model: Topic, include: [
            "userGroup"
          ]
        }]
      },
      {
        model: Post, as: "comments", attributes: ["id"]
      }
    ]
  });

  // Retrieve groups for user
  const groups = await user.getUserGroups({ attributes: ["id", "name", "groupMembership"] });
  // Retrieve interests for user
  const interests = await user.getInterestedTopics({ attributes: ["id", "title"] });
  // Check if user is an admin
  const admin = await user.isAdmin();

  return res.send({
    id, username,
    image: `${CLOUDFRONT_URL}/${image}`,
    admin,
    posts,
    groups,
    interests
  });
});

export default router;
