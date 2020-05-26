import { Router } from "express";
import * as passport from "passport";

import User from "../models/user";

import APIRouter from "./api";
import SNSRouter from "./sns";
import VideoRouter from "./video";

const router = Router();

router.use("/api", APIRouter);
router.use("/sns", SNSRouter);
router.use("/video", VideoRouter);

router.get("/", (_, res) => {
  res.render("index", { title: "MediaVault" });
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  res.send({
    status: "OK"
  });
});

router.post("/register", async (req, res) => {
  const { username, password, confirmation } = req.body;

  if (password === confirmation) {
    const userExists = await User.findOne({ username });

    if (!userExists) {
      const newUser = new User({ username });

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

export default router;
