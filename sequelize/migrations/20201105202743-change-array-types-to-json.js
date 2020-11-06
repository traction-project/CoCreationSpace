"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("multimedia", "thumbnails", {
      type: "JSON USING to_json(thumbnails)::JSON",
    });

    await queryInterface.changeColumn("multimedia", "resolutions", {
      type: "JSON USING to_json(resolutions)::JSON",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("multimedia", "thumbnails", {
      type: "VARCHAR[] USING translate(thumbnails::text, '[]', '{}')::VARCHAR[]"
    });

    await queryInterface.changeColumn("multimedia", "resolutions", {
      type: "INTEGER[] USING translate(resolutions::text, '[]', '{}')::INT[]"
    });
  }
};
