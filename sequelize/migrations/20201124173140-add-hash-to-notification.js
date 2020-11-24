"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "notifications",
      "hash",
      {
        type: Sequelize.DataTypes.STRING
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "notifications",
      "hash"
    );
  }
};
