"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.renameTable("metadata", "metadata_items");
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.renameTable("metadata_items", "metadata");
  }
};
