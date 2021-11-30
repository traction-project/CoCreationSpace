"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("user_permissions", "user_group_id", {
      type: Sequelize.DataTypes.UUID,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("user_permissions", "user_group_id");
  }
};
