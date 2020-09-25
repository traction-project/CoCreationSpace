"use strict";

//  DB table name
const TABLE_NAME = "post_references";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Model attributtes
    const attributes = {
      created_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      post_references_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      post_referenced_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      }
    };

    return queryInterface.createTable(TABLE_NAME, attributes);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
