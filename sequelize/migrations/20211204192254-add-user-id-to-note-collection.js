"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("note_collections", "user_id", {
      type: Sequelize.DataTypes.UUID
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("note_collections", "user_id");
  }
};
