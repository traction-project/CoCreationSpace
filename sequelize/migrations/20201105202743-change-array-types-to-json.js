"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("multimedia", "thumbnails", {
      type: Sequelize.DataTypes.JSON
    });

    await queryInterface.changeColumn("multimedia", "resolutions", {
      type: Sequelize.DataTypes.JSON
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("multimedia", "thumbnails", {
      type: Sequelize.DataTypes.ARRAY
    });

    await queryInterface.changeColumn("multimedia", "resolutions", {
      type: Sequelize.DataTypes.ARRAY
    });
  }
};
