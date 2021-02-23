"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "emoji_reactions",
      "multimedia_id",
      {
        type: Sequelize.DataTypes.UUID
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      "emoji_reactions",
      "multimedia_id"
    );
  }
};
