"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn("video_chapters", "media_item_id", {
      type: Sequelize.DataTypes.UUID,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn("video_chapters", "media_item_id", {
      type: Sequelize.DataTypes.UUID,
      allowNull: false
    });
  }
};
