import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import User from "../models/user";

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username }).then((user) => {
    if (!user || user.validatePassword(password)) {
      done(null, undefined, {
        message: "Username or password are invalid"
      });
    }

    done(null, user);
  }).catch(
    done
  );
}));
