import { Router } from "express";
import passport from "passport";
import { readFileSync } from "fs";

import APIRouter from "./api";
import SNSRouter from "./sns";
import MediaRouter from "./media";
import ImageRouter from "./images";
import PostRouter from "./post";
import ThreadRouter from "./thread";
import TagRouter from "./tag";
import TopicRouter from "./topic";
import TranslateRouter from "./translate";
import UserRouter from "./user";
import NotificationRouter from "./notification";
import GroupRouter from "./group";

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
router.use("/media", MediaRouter);
router.use("/notifications", NotificationRouter);
router.use("/images", ImageRouter);
router.use("/groups", GroupRouter);

router.get("/", (_, res) => {
  res.render("index", { title: "MediaVault", enableAnalytics: process.env.ENABLE_ANALYTICS == "true" });
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

router.post("/internalnavigation", async (req, res) => {
  const { InternalNavigationStep, Users } = db.getModels();

  const navigationData: { userId: string, data: any } = req.body;
  const navigationStep = await InternalNavigationStep.create({
    data: navigationData.data,
    userAgent: req.get("User-Agent")
  });

  if (navigationData.userId) {
    const user = await Users.findByPk(navigationData.userId);
    user && navigationStep.setUser(user);
  }

  res.send({
    status: "OK"
  });
});

export default router;
