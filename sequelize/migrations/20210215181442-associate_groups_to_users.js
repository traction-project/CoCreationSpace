"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "user_group_users",
      {
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        user_group_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("user_group_users");
  }
};
