"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("posts", "published", {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("posts", "published");
  }
};
