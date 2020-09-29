"use strict";

const addColumImage = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "users",
    "image",
    {
      type: Sequelize.DataTypes.STRING
    }
  );
};

const removeColumnImage = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "users",
    "image"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    addColumImage(queryInterface, Sequelize);
  },

  down: async (queryInterface, Sequelize) => {
    removeColumnImage(queryInterface, Sequelize);
  }
};
