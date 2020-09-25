"use strict";
const uuid = require("uuid");
const crypto = require("crypto");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const username = process.env.SEED_SUPERUSER_USERNAME || "admin";
    let password = process.env.SEED_SUPERUSER_PASSWORD || "admin";
    const salt = crypto.randomBytes(16).toString("hex");
    
    const keyPasswordLeng = 512;
    password = crypto.pbkdf2Sync(
      password, salt,
      10000, keyPasswordLeng,
      "sha512"
    ).toString("hex");

    return queryInterface.bulkInsert("users", [{
      id: uuid.v4(),
      username,
      password,
      salt,
      role: "admin",
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("users", {
      username: "admin"
    });
  }
};
