"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint(
      "topics",
      "topics_title_key"
    );
  },

  down: async (queryInterface, Sequelize) => {
  }
};
