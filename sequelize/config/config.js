require("dotenv").config();

module.exports = {
  "development": {
    "username": process.env.POSTGRES_USER,
    "password": process.env.POSTGRES_PASSWORD,
    "database": process.env.POSTGRES_DB,
    "host": process.env.POSTGRES_HOST,
    "dialect": "postgres"
  },
  "production": {
    "username": "admin",
    "password": "admin",
    "database": "mediavault",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
};
