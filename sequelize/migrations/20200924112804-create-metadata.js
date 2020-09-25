"use strict";

//  DB table name
const TABLE_NAME = "metadata";

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
      metadata_type: {
        type: Sequelize.DataTypes.STRING
      },
      value: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      roi: {
        type: Sequelize.DataTypes.STRING
      },
      time_interval: {
        type: Sequelize.DataTypes.STRING
      }
    };

    return queryInterface.createTable(TABLE_NAME, attributes);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
