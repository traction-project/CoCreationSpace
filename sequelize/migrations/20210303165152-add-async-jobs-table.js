"use strict";

//  DB table name
const TABLE_NAME = "async_jobs";

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
      type: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.DataTypes.STRING,
        defaultValue: "processing"
      },
      job_id: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
      },
      multimedia_id: {
        type: Sequelize.DataTypes.UUID
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
