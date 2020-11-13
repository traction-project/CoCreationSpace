"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      "users",
      "permission_id"
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "users",
      "permission_id",
      {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: "permissions",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      }
    );
  }
};
