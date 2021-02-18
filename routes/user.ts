import { Router } from "express";
import Busboy from "busboy";
import { v4 as uuid4 } from "uuid";

import { getExtension, getFromEnvironment } from "../util";
import { authRequired } from "../util/middleware";
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
 * Makes the current user join the group identified by the given id. Returns
 * 200 on success, or 404 if the group with the given id cannot be found.
 */
router.post("/group/:id/join", authRequired, async (req, res) => {
  const { UserGroup } = db.getModels();

  const { id } = req.params;
  const user = req.user as UserInstance;

  const group = await UserGroup.findByPk(id);

  if (group) {
    await user.addUserGroup(group);

    res.send({
      status: "ok"
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "Group not found"
    });
  }
});

/**
 * Makes the current user leave the group identified by the given id. Returns
 * 200 on success, or 404 if the group with the given id cannot be found.
 */
router.post("/group/:id/leave", authRequired, async (req, res) => {
  const { UserGroup } = db.getModels();

  const { id } = req.params;
  const user = req.user as UserInstance;

  const group = await UserGroup.findByPk(id);

  if (group) {
    await user.removeUserGroup(group);

    res.send({
      status: "ok"
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "Group not found"
    });
  }
});

export default router;
