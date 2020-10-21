"use strict";

// Post Association
const upEmojiReactionAssociationBelongsToPost = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "emoji_reactions",
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
const downEmojiReactionAssociationBelongsToPost = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "emoji_reactions",
    "post_id"
  );
};

// User Association
const upEmojiReactionAssociationBelongsToUser = (queryInterface, Sequelize) => {
  return queryInterface.addColumn(
    "emoji_reactions",
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
const downEmojiReactionAssociationBelongsToUser = (queryInterface, Sequelize) => {
  return queryInterface.removeColumn(
    "emoji_reactions",
    "user_id"
  );
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    upEmojiReactionAssociationBelongsToPost(queryInterface, Sequelize);
    upEmojiReactionAssociationBelongsToUser(queryInterface, Sequelize);
  },

  down: async (queryInterface, Sequelize) => {
    downEmojiReactionAssociationBelongsToPost(queryInterface, Sequelize);
    downEmojiReactionAssociationBelongsToUser(queryInterface, Sequelize);
  }
};
