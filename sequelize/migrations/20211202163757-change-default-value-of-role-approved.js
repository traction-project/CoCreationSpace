"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn("user_group_users", "role_approved", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn("user_group_users", "role_approved", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    });
  }
};
