import * as dotenv from "dotenv";
import { getFromEnvironment } from "./util";

dotenv.config();
const [ SESSION_SECRET, DB_URL ] = getFromEnvironment("SESSION_SECRET", "DB_URL");

import * as express from "express";
import * as session from "express-session";
import * as connectMongo from "connect-mongo";
import * as logger from "morgan";
import * as path from "path";
import * as createError from "http-errors";
import * as cookieParser from "cookie-parser";
import * as passport from "passport";
import * as mongoose from "mongoose";

import indexRouter from "./routes/index";
import apiIndexRouter from "./routes/api";

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());

const MongoStore = connectMongo(session);

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

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
app.use("/api", apiIndexRouter);

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

export default app;
