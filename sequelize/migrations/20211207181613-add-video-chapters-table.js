"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable("video_chapters", {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      start_time: {
        type: Sequelize.DataTypes.DOUBLE,
        allowNull: false
      },
      media_item_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("video_chapters");
  }
};
