"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "users",
      "reset_at",
      {
        type: Sequelize.DataTypes.DATE
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "users",
      "reset_at"
    );
  }
};
