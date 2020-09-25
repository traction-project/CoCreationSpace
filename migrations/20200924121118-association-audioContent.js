"use strict";

// Multimedia Association
const upMultimediaAssociationBelongsTo = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "audio_content",
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
    "audio_content",
    "multimedia_id"
  );
};

// Metadata Association
const upMetadataAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "metadata",
    "audio_content_id",
    {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: "audio_content",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    }
  );
};
const downMetadataAssociationHasMany = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "metadata",
    "audio_content_id"
  );
};


module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        upMultimediaAssociationBelongsTo(queryInterface, Sequelize),
        upMetadataAssociationHasMany(queryInterface, Sequelize)
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all(
      [
        downMultimediaAssociationBelongsTo(queryInterface, Sequelize),
        downMetadataAssociationHasMany(queryInterface, Sequelize)
      ]
    );
  }
};
