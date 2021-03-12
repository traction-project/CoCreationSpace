"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "topics",
      "user_group_id",
      {
        type: Sequelize.DataTypes.UUID
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "topics",
      "user_group_id"
    );
  }
};
