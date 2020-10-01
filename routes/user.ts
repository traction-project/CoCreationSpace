import { Router } from "express";
import * as Busboy from "busboy";
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
  let { id, username, image} = req.user as UserInstance;

  image = `${CLOUDFRONT_URL}/${image}`;
  return res.send({id, username, image});

});

/**
 * Modify user account (username and password)
 */
router.put("/", authRequired, async (req, res) => {
  const userModel = db.getModels().Users;
  let user = req.user as UserInstance;
  const { body } = req;

  if (body.username) {
    const existUser = await userModel.findOne({ where: { username: body.username }});
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
  if (body.password) {
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

  let { id, username, image} = user;
  image = `${CLOUDFRONT_URL}/${image}`;
  res.send({ id, username, image});
});

export default router;