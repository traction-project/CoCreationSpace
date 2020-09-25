"use strict";

// Permissions Association
const upPermissionsAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "users",
    "permission_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "permissions",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};
const downPermissionsAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "users",
    "permission_id"
  );
};

// Preferences Association
const upPreferencesAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "users",
    "preferences_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "preferences",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};
const downPreferencesAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "users",
    "preferences_id"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        upPermissionsAssociationBelongsTo(queryInterface, Sequelize),
        upPreferencesAssociationBelongsTo(queryInterface, Sequelize)
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        downPermissionsAssociationBelongsTo(queryInterface, Sequelize),
        downPreferencesAssociationBelongsTo(queryInterface, Sequelize)
      ]
    );
  }
};
