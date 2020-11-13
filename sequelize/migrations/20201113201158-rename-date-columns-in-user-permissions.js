"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("user_permissions", "createdAt", "created_at");
    await queryInterface.renameColumn("user_permissions", "updatedAt", "updated_at");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("user_permissions", "created_at", "createdAt");
    await queryInterface.renameColumn("user_permissions", "updated_at", "updatedAt");
  }
};
