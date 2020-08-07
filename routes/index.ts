import { Router } from "express";
import * as passport from "passport";
import { readFileSync } from "fs";

import APIRouter from "./api";
import SNSRouter from "./sns";
import VideoRouter from "./video";
import { UserInstance } from "../models/users";
import { db } from "../models";

const router = Router();

router.use("/api", APIRouter);
router.use("/sns", SNSRouter);
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
      username: user.username
    }
  });
});

router.post("/register", async (req, res) => {
  const User = db.getModels().Users;
  const { username, password, confirmation } = req.body;

  if (password === confirmation) {
    const userExists = await User.findOne({ where: { username } });

    if (!userExists) {
      const newUser = User.build({ username });

      newUser.setPassword(password);
      newUser.save();

      res.send({ status: "OK" });
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
