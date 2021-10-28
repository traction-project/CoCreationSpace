"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("multimedia", "media_items");

    await queryInterface.renameColumn("async_jobs", "multimedia_id", "media_item_id");
    await queryInterface.renameColumn("subtitles", "multimedia_id", "media_item_id");
    await queryInterface.renameColumn("multimedia_interactions", "multimedia_id", "media_item_id");
    await queryInterface.renameColumn("emoji_reactions", "multimedia_id", "media_item_id");

    await queryInterface.renameColumn("metadata", "multimedia_id", "media_item_id");
    await queryInterface.renameColumn("audio_content", "multimedia_id", "media_item_id");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("media_items", "multimedia");

    await queryInterface.renameColumn("async_jobs", "media_item_id", "multimedia_id");
    await queryInterface.renameColumn("subtitles", "media_item_id", "multimedia_id");
    await queryInterface.renameColumn("multimedia_interactions", "media_item_id", "multimedia_id");
    await queryInterface.renameColumn("emoji_reactions", "media_item_id", "multimedia_id");

    await queryInterface.renameColumn("metadata", "media_item_id", "multimedia_id");
    await queryInterface.renameColumn("audio_content", "media_item_id", "multimedia_id");
  }
};
