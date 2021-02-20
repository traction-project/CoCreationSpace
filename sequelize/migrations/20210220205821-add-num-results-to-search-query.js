"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "search_queries",
      "resultcount",
      {
        type: Sequelize.DataTypes.INTEGER
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "search_queries",
      "resultcount"
    );
  }
};
