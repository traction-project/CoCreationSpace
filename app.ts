import * as dotenv from "dotenv";
import * as http from "http";
import * as path from "path";
import * as passport from "passport";

import aws from "aws-sdk";
import express from "express";
import session from "express-session";
import logger from "morgan";
import createError from "http-errors";
import cookieParser from "cookie-parser";

const SequelizeStore = require("connect-session-sequelize")(session.Store);

dotenv.config();
aws.config.loadFromPath("./aws.json");

import { getFromEnvironment } from "./util";
import { snsMiddleware } from "./util/sns";
import indexRouter from "./routes/index";

const [SESSION_SECRET, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST] = getFromEnvironment("SESSION_SECRET", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_HOST");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(snsMiddleware);
app.use(logger("dev"));
app.use(express.json());

import "./auth/local";

// Connect to PostgreDB
import { Sequelize, Options } from "sequelize";
import { db } from "./models";

const options: Options = {
  dialect: "postgres",
  logging: false
};

const url = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}/${POSTGRES_DB}`;

const sequelize: Sequelize = new Sequelize(url, options);
db.createDB(sequelize);

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: new SequelizeStore({
    db: sequelize
  })
}));

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
