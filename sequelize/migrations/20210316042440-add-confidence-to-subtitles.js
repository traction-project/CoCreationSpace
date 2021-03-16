"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "subtitles",
      "confidence",
      {
        type: Sequelize.DataTypes.FLOAT
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "subtitles",
      "confidence"
    );
  }
};
