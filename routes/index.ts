import { Router } from "express";
import passport from "passport";
import { readFileSync } from "fs";

import APIRouter from "./api";
import SNSRouter from "./sns";
import VideoRouter from "./video";
import ImageRouter from "./images";
import PostRouter from "./post";
import ThreadRouter from "./thread";
import TagRouter from "./tag";
import TopicRouter from "./topic";
import TranslateRouter from "./translate";
import UserRouter from "./user";
import NotificationRouter from "./notification";

import { UserInstance } from "../models/users";
import { db } from "../models";
import { getFromEnvironment } from "../util";

const [ CLOUDFRONT_URL ] = getFromEnvironment("CLOUDFRONT_URL");
const router = Router();

router.use("/api", APIRouter);
router.use("/sns", SNSRouter);
router.use("/posts", PostRouter);
router.use("/tags", TagRouter);
router.use("/threads", ThreadRouter);
router.use("/topics", TopicRouter);
router.use("/translate", TranslateRouter);
router.use("/users", UserRouter);
router.use("/video", VideoRouter);
router.use("/notifications", NotificationRouter);
router.use("/images", ImageRouter);

router.get("/", (_, res) => {
  res.render("index", { title: "MediaVault" });
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  const user = req.user as UserInstance;

  res.send({
    status: "OK",
    user: {
      id: user.id,
      username: user.username,
      image: `${CLOUDFRONT_URL}/${user.image}`,
      preferredLanguage: user.preferredLanguage
    }
  });
});

router.post("/register", async (req, res) => {
  const { Users } = db.getModels();
  const { username, password, preferredLanguage } = req.body;

  const userExists = await Users.findOne({ where: { username } });

  if (!userExists) {
    const newUser = Users.build({ username, preferredLanguage });
    newUser.setPassword(password);

    try {
      await newUser.save();

      res.send({
        status: "OK"
      });
    } catch(err) {
      res.status(500).send({
        status: "ERR",
        message: err.message
      });
    }
  } else {
    res.status(400).send({
      status: "ERR",
      message: "Username exists"
    });
  }
});

router.post("/logout", (req, res) => {
  req.logout();

  res.send({
    status: "OK"
  });
});

router.get("/loginstatus", (req, res) => {
  res.send({
    loggedIn: req.user !== undefined
  });
});

router.get("/revision", (_, res) => {
  try {
    const REVISION = readFileSync("REVISION").toString().trim();
    res.send(REVISION);
  } catch {
    res.send("unknown");
  }
});

/**
 * Reset database to a pristine state for the trial.
 *
 * XXX THIS NEEDS TO BE DISABLED AFTER THE TRIAL!
 */
router.get("/resetdatabase", async (_, res) => {
  const { Posts, Users } = db.getModels();

  const numDeletedPosts = await Posts.destroy({
    where: {
      id: {
        $notIn: [
          "d921b0c7-5166-4643-bd2f-353eb7a9bc95",
          "91f34bf4-ce9e-4e39-9987-87c67c9b6acb",
          "79710032-afa8-4f49-87d6-056af56eb95b",
          "bf0931a3-6e07-4680-8e14-391cd91008a2",
          "c52f131d-919f-4e01-92dd-c20873aa4b9d",
          "0d8e32e9-6b7d-4dc6-ab54-8dff018502ec",
          "6ec6e300-0f34-4f4f-8d09-7480fb7909d6",
          "5fd0a6ee-40ce-4a18-8018-6604e94d5cad",
          "b40de631-173f-4525-a1c1-09d81efa8569",
          "3f6ddbea-dc2e-47da-a29b-d261f573e40e",
          "2482d38c-536f-4ed1-a00e-4b2ea2ac748a"
        ]
      }
    }
  });

  const numDeletedUsers = await Users.destroy({
    where: {
      id: {
        $notIn: [
          "1dd4713c-6644-4257-bc81-1747b8f42437",
          "c90d4627-c634-4825-8a97-979b2c350468",
          "e77c1a35-c8bb-4ba5-b3b0-38e7fbae6805",
          "b43590f5-847a-46c0-bcaf-970f69eea810",
          "308fdc59-edc2-492f-857b-6e8e6c7f6c22 "
        ]
      }
    }
  });

  return res.send({
    status: "OK",
    deletedRecords: {
      users: numDeletedUsers,
      posts: numDeletedPosts
    }
  });
});

export default router;
