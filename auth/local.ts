import * as passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import User, { User as UserSchema} from "../models/user";

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username }).then((user) => {
    if (user && user.validatePassword(password)) {
      done(null, user);
    } else {
      done(null, false, {
        message: "Username or password are invalid"
      });
    }
  }).catch(
    done
  );
}));

passport.serializeUser((user: UserSchema, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
