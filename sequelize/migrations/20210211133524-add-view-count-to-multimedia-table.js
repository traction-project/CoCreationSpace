"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "multimedia",
      "view_count",
      {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "multimedia",
      "view_count"
    );
  }
};
