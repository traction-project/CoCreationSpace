"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const generateConstraint = async (table, reference) => {
      queryInterface.addConstraint(table, {
        type: "foreign key",
        fields: [`${reference}_id`],
        references: {
          table: `${reference}s`,
          field: "id"
        },
        onDelete: "cascade",
        onUpdate: "cascade"
      });
    };

    generateConstraint("async_jobs", "media_item");
    generateConstraint("consent_forms", "user");
    generateConstraint("favourites", "user");
    generateConstraint("favourites", "post");
    generateConstraint("interests", "user");
    generateConstraint("interests", "topic");
    generateConstraint("internal_navigation_steps", "user");
    generateConstraint("likes", "user");
    generateConstraint("likes", "post");
    generateConstraint("multimedia_interactions", "media_item");
    generateConstraint("multimedia_interactions", "user");
    generateConstraint("note_collections", "user");
    generateConstraint("notifications", "user");
    generateConstraint("tag_references", "tag");
    generateConstraint("tag_references", "post");
    generateConstraint("topics", "user_group");
    generateConstraint("user_group_users", "user_group");
    generateConstraint("user_group_users", "user");
    generateConstraint("user_permissions", "user");
    generateConstraint("user_permissions", "permission");
    generateConstraint("user_references", "user");
    generateConstraint("user_references", "post");
    generateConstraint("video_chapters", "media_item");

    queryInterface.addConstraint("search_queries", {
      type: "foreign key",
      fields: ["user_id"],
      references: {
        table: "users",
        field: "id"
      },
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    queryInterface.addConstraint("user_followers", {
      type: "foreign key",
      fields: ["user_id"],
      references: {
        table: "users",
        field: "id"
      },
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    queryInterface.addConstraint("user_followers", {
      type: "foreign key",
      fields: ["follower_id"],
      references: {
        table: "users",
        field: "id"
      },
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    queryInterface.addConstraint("post_references", {
      type: "foreign key",
      fields: ["post_references_id"],
      references: {
        table: "posts",
        field: "id"
      },
      onDelete: "cascade",
      onUpdate: "cascade"
    });

    queryInterface.addConstraint("post_references", {
      type: "foreign key",
      fields: ["post_referenced_id"],
      references: {
        table: "posts",
        field: "id"
      },
      onDelete: "cascade",
      onUpdate: "cascade"
    });
  },

  down: async (queryInterface, Sequelize) => {
  }
};
