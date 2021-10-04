import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";

import { getFromEnvironment } from "../util";
import { UserInstance } from "../models/users";
import { db } from "../models";

const [ SESSION_SECRET ] = getFromEnvironment("SESSION_SECRET");

/**
 * Finds a user instance either by username or email. If the username provides
 * no match, the model is queried using the email field. It still no match is
 * found, null is returned.
 *
 * @param name The username or email to search for
 * @returns A user object matching either name or email, null otherwise
 */
async function findUserByUsernameOrEmail(name: string): Promise<UserInstance | null> {
  const { Users } = db.getModels();
  const user = await Users.findOne({ where: { username: name } });

  if (user) {
    return user;
  }

  return await Users.findOne({ where: { email: name } });
}

export default async function setup() {
  passport.use(new LocalStrategy(async (username, password, done) => {
    findUserByUsernameOrEmail(username).then((user: UserInstance) => {
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
