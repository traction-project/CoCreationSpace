"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("threads", "th_title", "title");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("threads", "title", "th_title");
  }
};
