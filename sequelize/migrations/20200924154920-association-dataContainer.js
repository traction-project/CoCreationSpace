"use strict";

// Post Association
const upPostAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "data_container",
    "post_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "posts",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};
const downPostAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "data_container",
    "post_id"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        upPostAssociationBelongsTo(queryInterface, Sequelize)
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        downPostAssociationBelongsTo(queryInterface, Sequelize)
      ]
    );
  }
};
