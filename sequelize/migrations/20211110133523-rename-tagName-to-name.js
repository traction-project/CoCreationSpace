"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("tags", "tag_name", "name");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("tags", "name", "tag_name");
  }
};
