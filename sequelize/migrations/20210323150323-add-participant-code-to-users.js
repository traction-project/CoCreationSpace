"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "users",
      "participant_code",
      {
        type: Sequelize.DataTypes.STRING
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "users",
      "participant_code"
    );
  }
};
