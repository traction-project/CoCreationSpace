"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("users", "theme", {
      type: Sequelize.DataTypes.STRING,
      defaultValue: "default"
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("users", "theme");
  }
};
