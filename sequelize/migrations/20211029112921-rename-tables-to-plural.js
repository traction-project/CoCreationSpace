"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("audio_content", "audio_contents");
    await queryInterface.renameTable("data_container", "data_containers");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("audio_contents", "audio_content");
    await queryInterface.renameTable("data_containers", "data_container");
  }
};
