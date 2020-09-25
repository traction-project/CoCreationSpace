"use strict";

// User Association
const upUserAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "multimedia",
    "user_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "users",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};
const downUserAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "multimedia",
    "user_id"
  );
};

// Data Container Association
const upDataContainerAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "multimedia",
    "data_container_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "data_container",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};
const downDataContainerAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "multimedia",
    "data_container_id"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        upUserAssociationBelongsTo(queryInterface, Sequelize),
        upDataContainerAssociationBelongsTo(queryInterface, Sequelize)
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        downUserAssociationBelongsTo(queryInterface, Sequelize),
        downDataContainerAssociationBelongsTo(queryInterface, Sequelize)
      ]
    );
  }
};
