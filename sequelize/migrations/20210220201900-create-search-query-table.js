"use strict";

//  DB table name
const TABLE_NAME = "search_queries";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Model attributtes
    const attributes = {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        allowNull: false,
        autoIncrement: false
      },
      user_id: {
        type: Sequelize.DataTypes.UUID
      },
      query: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      }
    };

    return queryInterface.createTable(TABLE_NAME, attributes);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
