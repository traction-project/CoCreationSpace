import { Router } from "express";
import passport from "passport";
import { readFileSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import { render } from "ejs";

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
import PermissionRouter from "./permission";
import NoteRouter from "./note";

import { UserInstance } from "../models/user";
import { db } from "../models";
import { getFromEnvironment, loadTemplate, sendEmail } from "../util";

const [ CLOUDFRONT_URL, SMTP_ADDRESS, SMTP_CREDENTIALS, VERIFICATION ] = getFromEnvironment("CLOUDFRONT_URL", "SMTP_ADDRESS", "SMTP_CREDENTIALS", "VERIFICATION");
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
router.use("/permissions", PermissionRouter);
router.use("/notes", NoteRouter);

router.get("/", (_, res) => {
  res.render("index", { title: "CoCreation Space", enableAnalytics: process.env.ENABLE_ANALYTICS == "true" });
});

router.post("/login", passport.authenticate("local"), async (req, res) => {
  const user = req.user as UserInstance;

  res.send({
    status: "OK",
    user: {
      id: user.id,
      username: user.username,
      image: `${CLOUDFRONT_URL}/${user.image}`,
      email: user.email,
      preferredLanguage: user.preferredLanguage,
      admin: await user.isAdmin(),
      theme: user.theme
    }
  });
});

router.post("/register", async (req, res) => {
  const { User } = db.getModels();
  const { username, password, email, preferredLanguage, participantCode, verification } = req.body;

  if (!verification || (verification != VERIFICATION)) {
    res.status(400).send({
      status: "ERR",
      message: "Verification code invalid"
    });
  }

  const userExists = await User.findOne({ where: { username } });

  if (!userExists) {
    const newUser = User.build({ username, email, preferredLanguage, participantCode });
    newUser.password = password;

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

/**
 * Allows for requesting the reset of the password for the account associated
 * to the given e-mail address by setting a reset token on the account and
 * sending an e-mail with a password reset link.
 */
router.post("/requestreset", async (req, res) => {
  const { User } = db.getModels();
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({
      status: "ERR",
      message: "No e-mail address supplied"
    });
  }

  const user = await User.findOne({ where: { email }});

  if (!user) {
    return res.status(404).send({
      status: "ERR",
      message: "No such e-mail"
    });
  }

  user.resettoken = uuidv4();
  await user.save();

  const [ host, port ] = SMTP_ADDRESS.split(":");
  const [ username, pass ] = SMTP_CREDENTIALS.split(":");

  const template = await loadTemplate(req.app, "resetpassword");

  await sendEmail(
    "TRACTION <noreply@traction-project.eu>",
    user.email!,
    "Reset the password for your TRACTION account",
    render(template, { username: user.username, token: user.resettoken }),
    [host, parseInt(port), username, pass]
  );

  res.send({
    status: "OK"
  });
});

/**
 * Resets the password for the account associated with the given reset token to
 * the provided value.
 */
router.post("/resetpassword", async (req, res) => {
  const { User } = db.getModels();
  const { resettoken, password } = req.body;

  if (!resettoken || !password) {
    return res.status(400).send({
      status: "ERR",
      message: "Invalid input data"
    });
  }

  const user = await User.findOne({ where: { resettoken }});

  if (!user) {
    return res.status(404).send({
      status: "ERR",
      message: "No such reset token"
    });
  }

  user.resettoken = null;
  user.resetAt = new Date();
  user.password = password;
  await user.save();

  res.send({
    status: "OK"
  });
});

/**
 * Validates a given reset token and returns whether the token exists or not in
 * the response.
 */
router.get("/token/:token/valid", async (req, res) => {
  const { User } = db.getModels();
  const { token } = req.params;

  const user = await User.findOne({ where: { resettoken: token }});

  res.send({
    status: "OK",
    valid: user != null
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
  const { InternalNavigationStep, User } = db.getModels();

  const navigationData: { userId: string, data: any } = req.body;
  const navigationStep = await InternalNavigationStep.create({
    data: navigationData.data,
    userAgent: req.get("User-Agent")
  });

  if (navigationData.userId) {
    const user = await User.findByPk(navigationData.userId);
    user && navigationStep.setUser(user);
  }

  res.send({
    status: "OK"
  });
});

export default router;
