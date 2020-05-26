import { Router } from "express";
import * as passport from "passport";

import User, { User as UserSchema } from "../models/user";

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

router.post("/login", (req, res, next) => {
  const { username, password  } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      status: "ERR",
      message: "Insufficient parameters"
    });
  }

  return passport.authenticate("local", (err: Error | null, user: UserSchema | undefined, msg: { message: string }) => {
    if (err) {
      return next(err);
    }

    if (user) {
      return res.send({
        status: "OK"
      });
    }

    res.status(401).send({
      status: "ERR",
      ...msg
    });
  })(req, res, next);
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
