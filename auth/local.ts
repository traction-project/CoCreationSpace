import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { UserInstance } from "../models/users";
import { db } from "../models";

passport.use(new LocalStrategy((username, password, done) => {
  const { Users } = db.getModels();

  Users.findOne( { where: { username } }).then((user: UserInstance) => {
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

passport.serializeUser((user: UserInstance, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  const { Users } = db.getModels();

  Users.findOne({where : { id }}).then((user: UserInstance) => {
    done(null, user);
  }).catch(done);
});
