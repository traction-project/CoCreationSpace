"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.createTable("favourites", {
      user_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      post_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        primaryKey: true
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
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("favourites");
  }
};
