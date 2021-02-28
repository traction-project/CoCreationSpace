"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "posts",
      "multimedia_ref",
      {
        type: Sequelize.DataTypes.UUID
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "posts",
      "multimedia_ref"
    );
  }
};
