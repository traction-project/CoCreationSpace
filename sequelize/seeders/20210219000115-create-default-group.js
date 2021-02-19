"use strict";

const uuid = require("uuid");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("user_groups", [{
      id: uuid.v4(),
      name: "Default",
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("user_groups", null, {});
  }
};
