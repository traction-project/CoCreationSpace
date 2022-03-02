import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import logger from "morgan";
import createError from "http-errors";
import cookieParser from "cookie-parser";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import passport from "passport";
import aws from "aws-sdk";
import Umzug from "umzug";
import expressStaticGzip from "express-static-gzip";

dotenv.config({ path: process.env.ENV_FILE_PATH });
aws.config.loadFromPath(process.env.AWS_CREDENTIAL_FILE_PATH || "./aws.json");

import { getFromEnvironment } from "./util";
import { snsMiddleware, subscribeToSNSTopic } from "./util/sns";
import setupAuth from "./auth/local";
import setupWebSocketServer from "./pubsub";
import indexRouter from "./routes/index";

const [
  SESSION_SECRET, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST,
  SNS_ENDPOINT, SNS_ARN
] = getFromEnvironment(
  "SESSION_SECRET", "POSTGRES_DB", "POSTGRES_USER", "POSTGRES_PASSWORD",
  "POSTGRES_HOST", "SNS_ENDPOINT", "SNS_ARN"
);

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

  console.log("Running migrations...");
  await umzug.up();

  console.log("Setting up models...");
  await db.createDB(sequelize);
}

async function setupDatabaseSeeds() {
  const umzug = new Umzug({
    migrations: {
      path: path.join(__dirname, "./sequelize/seeders"),
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

  console.log("Running seeder migrations...");
  await umzug.up();
}

async function setupServer(): Promise<http.Server> {
  return new Promise((resolve) => {
    const app = express();

    // view engine setup
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");

    app.use(snsMiddleware);
    app.use(logger("dev"));
    app.use(express.json());

    const SequelizeSessionStore = require("connect-session-sequelize")(session.Store);
    const sessionStore = new SequelizeSessionStore({ db: sequelize });

    app.use(session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 30 * 6 // 6 months
      },
      store: sessionStore
    }));

    sessionStore.sync();

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    if (app.get("env") == "development") {
      app.use(express.static(path.join(__dirname, "public")));
    } else {
      app.use("/", expressStaticGzip(path.join(__dirname, "public"), {
        index: false
      }));
    }

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

    let server: http.Server;
    const port = process.env.PORT || "3000";
    app.set("port", port);

    const [ key, cert ] = [
      path.resolve("cert/server.key"),
      path.resolve("cert/server.crt")
    ];

    if (process.env.NODE_ENV == "development" && fs.existsSync(key) && fs.existsSync(cert)) {
      console.log("Starting HTTPS server...");

      server = https.createServer({
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
      }, app);
    } else {
      console.log("Starting HTTP server...");
      server = http.createServer(app);
    }

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
      resolve(server);
    });
  });
}

async function setupSNSEndpoint() {
  const endpointUrl = SNS_ENDPOINT + "/sns/receive";
  console.log("Subscribing to", SNS_ARN, "with endpoint", endpointUrl);

  try {
    await subscribeToSNSTopic(SNS_ARN, endpointUrl);
    console.log("Successfully sent SNS subscription request");
  } catch (err) {
    console.error("Could not subscribe to SNS channel:", err);
  }
}

async function launch() {
  console.log("Current environment:", process.env.NODE_ENV || "unknown");

  await setupDatabase();
  await setupDatabaseSeeds();

  const httpServer = await setupServer();
  await setupWebSocketServer(httpServer);

  await setupAuth();
  await setupSNSEndpoint();
}

launch();
