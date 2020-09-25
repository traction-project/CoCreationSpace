"use strict";

const upThreadsAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "threads",
    "topic_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "topics",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};

const downThreadsAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "threads",
    "topic_id"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([upThreadsAssociationHasMany(queryInterface, Sequelize)]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([downThreadsAssociationHasMany(queryInterface, Sequelize)]);
  }
};
