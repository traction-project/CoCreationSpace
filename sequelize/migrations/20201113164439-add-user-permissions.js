"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "user_permissions",
      {
        createdAt: {
          allowNull: false,
          defaultValue: Sequelize.NOW,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          defaultValue: Sequelize.NOW,
          type: Sequelize.DATE,
        },
        user_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        permission_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_permissions");
  }
};
