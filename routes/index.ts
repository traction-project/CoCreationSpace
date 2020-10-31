import { Router } from "express";
import passport from "passport";
import { readFileSync } from "fs";

import APIRouter from "./api";
import SNSRouter from "./sns";
import VideoRouter from "./video";
import PostRouter from "./post";
import ThreadRouter from "./thread";
import TagRouter from "./tag";
import TranslateRouter from "./translate";
import UserRouter from "./user";

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
router.use("/translate", TranslateRouter);
router.use("/users", UserRouter);
router.use("/video", VideoRouter);

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
      image: `${CLOUDFRONT_URL}/${user.image}`
    }
  });
});

router.post("/register", async (req, res) => {
  const { Users } = db.getModels();
  const { username, password, confirmation, preferredLanguage } = req.body;

  if (password === confirmation) {
    const userExists = await Users.findOne({ where: { username } });

    if (!userExists) {
      const newUser = Users.build({ username, preferredLanguage });

      newUser.setPassword(password);
      try {
        await newUser.save();
        res.send({ status: "OK" });
      } catch(err) {
        res.status(500);
        res.send({
          status: "ERR",
          message: err.message
        });
      }
    } else {
      res.status(400);
      res.send({
        status: "ERR",
        message: "Username exists"
      });
    }
  } else {
    res.status(400);
    res.send({
      status: "ERR",
      message: "Password does not match confirmation"
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

export default router;
