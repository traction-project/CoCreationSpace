import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import { Op } from "sequelize";

import { getFromEnvironment } from "../util";
import { UserInstance } from "../models/users";
import { db } from "../models";

const [ SESSION_SECRET ] = getFromEnvironment("SESSION_SECRET");

export default async function setup() {
  passport.use(new LocalStrategy(async (username, password, done) => {
    const { Users } = db.getModels();

    Users.findOne( { where: { [Op.or]: { username, email: username } } }).then((user: UserInstance) => {
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

  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SESSION_SECRET
  }, (token, done) => {
    const { Users } = db.getModels();

    Users.findByPk(token.id).then((user) => {
      if (user) {
        done(null, user);
      } else {
        console.log("user not found");
        done(new Error("Token invalid"));
      }
    });
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
}
