"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("user_group_users", "approved", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    });

    queryInterface.addColumn("user_group_users", "role", {
      type: Sequelize.DataTypes.STRING,
      defaultValue: "participant"
    });

    queryInterface.addColumn("user_group_users", "role_approved", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("user_group_users", "approved");
    queryInterface.removeColumn("user_group_users", "role");
    queryInterface.removeColumn("user_group_users", "role_approved");
  }
};
