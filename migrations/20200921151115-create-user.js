"use strict";

// DB table name
const TABLE_NAME = "users";

module.exports = {
  up: function (queryInterface, Sequelize) {
    const keyPasswordLeng = 512;
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
      username: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.DataTypes.STRING(keyPasswordLeng * 2),
        unique: true
      },
      salt: {
        type: Sequelize.DataTypes.STRING
      },
      role: {
        type: Sequelize.DataTypes.STRING
      }
    };

    return queryInterface.createTable(TABLE_NAME, attributes);
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
