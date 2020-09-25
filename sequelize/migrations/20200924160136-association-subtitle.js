"use strict";

// Multimedia Association
const upMultimediaAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "subtitles",
    "multimedia_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "multimedia",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};
const downMultimediaAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "subtitles",
    "multimedia_id"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        upMultimediaAssociationBelongsTo(queryInterface, Sequelize)
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        downMultimediaAssociationBelongsTo(queryInterface, Sequelize)
      ]
    );
  }
};
