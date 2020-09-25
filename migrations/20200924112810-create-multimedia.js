"use strict";

//  DB table name
const TABLE_NAME = "multimedia";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Model attributtes
    const attributes = {
      id: {
        type: Sequelize.DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.DataTypes.UUIDV4,
        allowNull: false,
        autoIncrement: false
      },
      created_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      title: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      file: {
        type: Sequelize.DataTypes.STRING
      },
      status: {
        type: Sequelize.DataTypes.ENUM,
        values: ["pending", "processing", "done", "error"],
        defaultValue: "pending"
      },
      transcoding_job_id: {
        type: Sequelize.DataTypes.STRING
      },
      transcription_job_id: {
        type: Sequelize.DataTypes.STRING
      },
      thumbnails: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.STRING)
      },
      key: {
        type: Sequelize.DataTypes.STRING
      },
      transcript: {
        type: Sequelize.DataTypes.JSON
      },
      media_properties: {
        type: Sequelize.DataTypes.STRING
      },
      detected_properties: {
        type: Sequelize.DataTypes.STRING
      },
      audio_descriptions: {
        type: Sequelize.DataTypes.STRING
      },
      duration: {
        type: Sequelize.DataTypes.INTEGER
      },
      resolutions: {
        type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER)
      },
      type: {
        type: Sequelize.DataTypes.STRING
      }
    };
    return queryInterface.createTable(TABLE_NAME, attributes);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable(TABLE_NAME);
  }
};
