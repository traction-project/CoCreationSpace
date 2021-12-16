"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkUpdate("user_group_users", {
      approved: true,
      role: "participant",
      role_approved: true
    }, {});
  },

  down: async (queryInterface, Sequelize) => {
  }
};
