"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("emoji_reactions", "second", {
      type: Sequelize.DOUBLE
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("emoji_reactions", "second", {
      type: Sequelize.DECIMAL
    });
  }
};
