"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("media_items", "ocr_data");
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("media_items", "ocr_data", {
      type: Sequelize.DataTypes.JSON,
      allowNull: true
    });
  }
};
