"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("user_permissions", "approved", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("user_permissions", "approved");
  }
};
