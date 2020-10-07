"use strict";

const addColumnSecond = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "posts",
    "second",
    {
      type: Sequelize.DataTypes.DECIMAL
    }
  );
};

const removeColumnSecond = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "posts",
    "second"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    addColumnSecond(queryInterface, Sequelize);
  },

  down: async (queryInterface, Sequelize) => {
    removeColumnSecond(queryInterface, Sequelize);
  }
};
