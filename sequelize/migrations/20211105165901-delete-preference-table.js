"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("users", "preferences_id");
    await queryInterface.dropTable("preferences");
  },

  down: async (queryInterface, Sequelize) => {
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
      language: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
      }
    };

    await queryInterface.createTable("preferences", attributes);
  }
};
