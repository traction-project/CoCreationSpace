"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = await queryInterface.rawSelect("users", { plain: false }, ["id"]);
    const group = (await queryInterface.rawSelect("user_groups", { where: {
      name: "Default"
    }, plain: false }, ["id"]))[0];

    return queryInterface.bulkInsert("user_group_users", users.map((user) => {
      return {
        user_id: user.id,
        user_group_id: group.id,
        created_at: new Date(),
        updated_at: new Date()
      };
    }));
  },

  down: async (queryInterface, Sequelize) => {
    const group = (await queryInterface.rawSelect("user_groups", { where: {
      name: "Default"
    }, plain: false }, ["id"]))[0];

    await queryInterface.bulkDelete("user_groups_users", null, {
      where: {
        user_group_id: group.id
      }
    });
  }
};
