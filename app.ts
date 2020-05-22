import * as dotenv from "dotenv";
import * as aws from "aws-sdk";
import * as http from "http";
import * as express from "express";
import * as session from "express-session";
import * as connectMongo from "connect-mongo";
import * as logger from "morgan";
import * as path from "path";
import * as createError from "http-errors";
import * as cookieParser from "cookie-parser";
import * as passport from "passport";
import * as mongoose from "mongoose";

import { getFromEnvironment } from "./util";

import indexRouter from "./routes/index";
import snsRouter from "./routes/sns";

dotenv.config();
aws.config.loadFromPath("./aws.json");

const [ SESSION_SECRET, DB_URL ] = getFromEnvironment("SESSION_SECRET", "DB_URL");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

import "./models/user";
import "./models/video";

import "./auth/local";

const MongoStore = connectMongo(session);
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: new MongoStore({ url: `${DB_URL!}/traction` })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/sns", snsRouter);

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
