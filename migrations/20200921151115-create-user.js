"use strict";
const sequelize_1 = require("sequelize");
module.exports = {
  up: function (queryInterface, sequelize) {
    const keyPasswordLeng = 512;
    const attributes = {
      id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        allowNull: false,
        autoIncrement: false
      },
      created_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.NOW,
        allowNull: false
      },
      updated_at: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.NOW,
        allowNull: false
      },
      username: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: sequelize_1.DataTypes.STRING(keyPasswordLeng * 2),
        unique: true
      },
      salt: {
        type: sequelize_1.DataTypes.STRING
      },
      role: {
        type: sequelize_1.DataTypes.STRING
      }
    };

    return queryInterface.createTable("users", attributes);
  },
  down: function (queryInterface, Sequelize) {
    return queryInterface.dropTable("users");
  }
};
