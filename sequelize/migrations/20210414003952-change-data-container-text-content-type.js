"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn("data_container", "text_content", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn("data_container", "text_content", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
