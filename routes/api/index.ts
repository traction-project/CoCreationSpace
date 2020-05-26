import { Router } from "express";
import * as passport from "passport";

import { User as UserSchema } from "../../models/user";

const router = Router();

router.get("/", (_, res) => {
  res.send({
    status: "OK"
  });
});

router.post("/login", (req, res, next) => {
  const { username, password  } = req.body;

  if (!username || !password) {
    return res.status(400).send({
      status: "ERR",
      message: "Insufficient parameters"
    });
  }

  return passport.authenticate("local", { session: false }, (err: Error | null, user: UserSchema | undefined, msg: { message: string }) => {
    if (err) {
      return next(err);
    }

    if (user) {
      return res.send(user.getAuth());
    }

    res.status(401).send({
      status: "ERR",
      ...msg
    });
  })(req, res, next);
});

export default router;
