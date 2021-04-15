"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "notifications",
      "deleted_at",
      {
        type: Sequelize.DataTypes.DATE
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "notifications",
      "deleted_at"
    );
  }
};
