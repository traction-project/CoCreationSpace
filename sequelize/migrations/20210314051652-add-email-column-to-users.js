"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "users",
      "email",
      {
        type: Sequelize.DataTypes.STRING,
        unique: true
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "users",
      "email"
    );
  }
};
