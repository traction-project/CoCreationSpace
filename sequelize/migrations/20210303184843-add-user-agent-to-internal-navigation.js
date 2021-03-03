"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "internal_navigation_steps",
      "user_agent",
      {
        type: Sequelize.DataTypes.STRING
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "internal_navigation_steps",
      "user_agent"
    );
  }
};
