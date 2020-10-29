import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import logger from "morgan";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import http from "http";
import path from "path";
import passport from "passport";
import aws from "aws-sdk";
import Umzug from "umzug";

dotenv.config();
aws.config.loadFromPath("./aws.json");

import { getFromEnvironment } from "./util";
import { snsMiddleware } from "./util/sns";
import setupAuth from "./auth/local";
import indexRouter from "./routes/index";

const [SESSION_SECRET, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST] = getFromEnvironment("SESSION_SECRET", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_HOST");

// Connect to PostgreDB
import { Sequelize, Options } from "sequelize";
import { db } from "./models";

const options: Options = {
  dialect: "postgres",
  logging: false
};

const url = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DB}`;

const sequelize: Sequelize = new Sequelize(url, options);

async function setupDatabase() {
  const umzug = new Umzug({
    migrations: {
      path: path.join(__dirname, "./sequelize/migrations"),
      params: [
        sequelize.getQueryInterface(),
        Sequelize
      ]
    },
    logging: (msg: string) => {
      console.log(msg);
    },
    storage: "sequelize",
    storageOptions: {
      sequelize: sequelize
    }
  });

  await umzug.up();
  await db.createDB(sequelize);
}

function setupServer() {
  const app = express();

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");

  app.use(snsMiddleware);
  app.use(logger("dev"));
  app.use(express.json());

  setupAuth();

  const SequelizeSessionStore = require("connect-session-sequelize")(session.Store);
  const sessionStore = new SequelizeSessionStore({ db: sequelize });

  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: sessionStore
  }));

  sessionStore.sync();

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  app.use("/", indexRouter);

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // error handler
  app.use((err: any, req: express.Request, res: express.Response) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  const port = process.env.PORT || "3000";
  app.set("port", port);

  const server = http.createServer(app);
  server.listen(port);

  server.on("error", (error: any) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case "EADDRINUSE":
      console.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
    }
  });

  server.on("listening", () => {
    console.log(`Server listening on port ${port}`);
  });
}

async function launch() {
  await setupDatabase();
  setupServer();
}

launch();
