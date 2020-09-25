"use strict";

// Post Association
const upPostAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "posts",
    "parent_post_id",
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
const downPostAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "posts",
    "parent_post_id"
  );
};

// User Association
const upUserAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "posts",
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
const downUserAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "posts",
    "user_id"
  );
};

// Thread Association
const upThreadAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "posts",
    "thread_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "threads",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};
const downThreadAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "posts",
    "thread_id"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        upPostAssociationHasMany(queryInterface, Sequelize),
        upUserAssociationHasMany(queryInterface, Sequelize),
        upThreadAssociationHasMany(queryInterface, Sequelize)
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        downPostAssociationHasMany(queryInterface, Sequelize),
        downUserAssociationHasMany(queryInterface, Sequelize),
        downThreadAssociationHasMany(queryInterface, Sequelize)
      ]
    );
  }
};
