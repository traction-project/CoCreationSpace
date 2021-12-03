"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable("media_item_note_collections", {
      created_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
      },
      note_collection_id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
      },
      media_item_id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("media_item_note_collections");
  }
};
