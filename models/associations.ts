import { DbInterface } from "util/typing/DbInterface";
import { HasOne, HasMany } from "sequelize/types/lib/associations";
import { PostInstance } from "./post";
import { DataContainerInstance } from "./data_container";
import { MultimediaInstance } from "./multimedia";

type AssociationType = {
  datacontainerAssociations: {
    DatacontainerMultimedia: HasMany<DataContainerInstance, MultimediaInstance>
  },
  postAssociations: {
    PostDataContainer: HasOne<PostInstance, DataContainerInstance>;
  }
}

class Associations {

  private associatons: AssociationType;

  getAssociatons(): AssociationType {
    return this.associatons;
  }

  createAssociations(models: DbInterface) {
    audioContentAssociations(models);
    const datacontainerAssociations = dataContainerAssociations(models);
    emojiReactionsAssociations(models);
    metadataAssociations(models);
    multimediaAssociations(models);
    permissionsAssociations(models);
    const postAssociations = postsAssociations(models);
    subtitleAssociations(models);
    tagAssociations(models);
    topicAssociations(models);
    threadAssociations(models);
    userAssociations(models);
    notificationAssociations(models);

    this.associatons = {
      datacontainerAssociations,
      postAssociations
    };
  }
}

const association = new Associations();

export default association;

/**
 *  Create all AudioContent table relationship with rest of tables
 * @param models DbInterface
 */
function audioContentAssociations(models: DbInterface): void {
  models.AudioContent.belongsTo(models.Multimedia, { as: "multimedia", foreignKey: "multimedia_id" });
  models.AudioContent.hasMany(models.Metadata, { as: "metadata", foreignKey: "audio_content_id" });
}

/**
 *  Create all DataContainer table relationship with rest of tables
 * @param models DbInterface
 */
function dataContainerAssociations(models: DbInterface) {
  models.DataContainer.belongsTo(models.Posts, { as: "post", foreignKey: "post_id" });
  const DatacontainerMultimedia = models.DataContainer.hasMany(models.Multimedia, { as: "multimedia", foreignKey: "data_container_id" });

  return {
    DatacontainerMultimedia
  };
}

/**
 *  Create all EmojiReactions table relationship with rest of tables
 * @param models DbInterface
 */
function emojiReactionsAssociations(models: DbInterface) {
  models.EmojiReactions.belongsTo(models.Posts, { as: "post", foreignKey: "post_id" });
  models.EmojiReactions.belongsTo(models.Users, { as: "user", foreignKey: "user_id" });
}

/**
 *  Create all metadata table relationship with rest of tables
 * @param models DbInterface
 */
function metadataAssociations(models: DbInterface): void {
  models.Metadata.belongsTo(models.Multimedia, { as: "multimedia", foreignKey: "multimedia_id" });
  models.Metadata.belongsTo(models.AudioContent, { as: "audioContent", foreignKey: "audio_content_id" });
}

/**
 *  Create all multimedia table relationship with rest of tables
 * @param models DbInterface
 */
function multimediaAssociations(models: DbInterface): void {
  models.Multimedia.belongsTo(models.Users, { as: "user", foreignKey: "user_id" });
  models.Multimedia.belongsTo(models.DataContainer, { as: "dataContainer", foreignKey: "data_container_id" });
  models.Multimedia.hasMany(models.AudioContent, { as: "audioContent", foreignKey: "multimedia_id" });
  models.Multimedia.hasMany(models.Metadata, { as: "metadata", foreignKey: "multimedia_id"});
  models.Multimedia.hasMany(models.Subtitles, { as: "subtitle", foreignKey: "multimedia_id"});
}

/**
 *  Create all permissions table relationship with rest of tables
 * @param models DbInterface
 */
function postsAssociations(models: DbInterface) {
  const PostDataContainer = models.Posts.hasOne(models.DataContainer, { as: "dataContainer", foreignKey: "post_id" });
  models.Posts.hasMany(models.Posts, { as: "comments", foreignKey: "parent_post_id" });
  models.Posts.belongsTo(models.Users, { as: "user", foreignKey: "user_id" });
  models.Posts.belongsTo(models.Threads, { as: "thread", foreignKey: "thread_id" });

  const optionsPostsPosts = {
    through: {
      model: models.PostReferences,
      unique: false
    }
  };

  models.Posts.belongsToMany(models.Posts, Object.assign(optionsPostsPosts, {
    foreignKey: "post_references_id",
    as: "postReference"
  }));

  models.Posts.belongsToMany(models.Posts, Object.assign(optionsPostsPosts, {
    foreignKey: "post_referenced_id",
    as: "postReferenced"
  }));

  models.Posts.belongsToMany(models.Users, {
    through: {
      model: models.UserReferences,
      unique: false
    },
    foreignKey: "post_id",
    as: "userReferenced"
  });

  models.Posts.belongsToMany(models.Tags,{
    through: {
      model: models.TagReferences,
      unique: false
    },
    foreignKey: "post_id",
    as: "tags"
  });

  models.Posts.belongsToMany(models.Users, {
    through: {
      model: models.Likes,
      unique: false
    },
    foreignKey: "post_id",
    as: "likesUsers"
  });

  models.Posts.hasMany(models.EmojiReactions, {
    as: "emojiReactions",
    foreignKey: "post_id"
  });

  return {
    PostDataContainer
  };
}
/**
 *  Create all permissions table relationship with rest of tables
 * @param models DbInterface
 */
function permissionsAssociations(models: DbInterface): void {
  models.Permissions.belongsToMany(models.Users, {
    through: "user_permissions"
  });
}

/**
 *  Create all subtitle table relationship with rest of tables
 * @param models DbInterface
 */
function subtitleAssociations(models: DbInterface): void {
  models.Subtitles.belongsTo(models.Multimedia, { as: "multimedia", foreignKey: "multimedia_id" });
}

/**
 *  Create all tag table relationship with rest of tables
 * @param models DbInterface
 */
function tagAssociations(models: DbInterface): void {
  models.Tags.belongsToMany(models.Posts, {
    through: {
      model: models.TagReferences,
      unique: false
    },
    foreignKey: "tag_id",
    as: "post"
  });
}

/**
 *  Create all topic table relationship with rest of tables
 * @param models DbInterface
 */
function topicAssociations(models: DbInterface): void {
  models.Topics.hasMany(models.Threads, { as: "thread", foreignKey: "topic_id" });
  models.Topics.belongsToMany(models.Users, {
    through: {
      model: models.Interests,
      unique: false
    },
    foreignKey: "topic_id",
    as: "hasInterest"
  });
}

/**
 *  Create all thread table relationship with rest of tables
 * @param models DbInterface
 */
function threadAssociations(models: DbInterface): void {
  models.Threads.belongsTo(models.Topics, { as: "topic", foreignKey: "topic_id" });
  models.Threads.hasMany(models.Posts, { as: "post", foreignKey: "thread_id" });
}

/**
 *  Create all users table relationship with rest of tables
 * @param models DbInterface
 */
function userAssociations(models: DbInterface): void {
  models.Users.hasMany(models.Multimedia, { as: "multimedia", foreignKey: "user_id" });
  models.Users.belongsTo(models.Preferences, { as: "preferences", foreignKey: "preferences_id" });
  models.Users.hasMany(models.Posts, { as: "post", foreignKey: "user_id" });
  models.Users.hasMany(models.Notifications, { as: "notifications", foreignKey: "user_id" });

  models.Users.belongsToMany(models.Permissions, {
    through: "user_permissions"
  });

  models.Users.belongsToMany(models.Posts, {
    through: {
      model: models.UserReferences,
      unique: false
    },
    foreignKey: "user_id",
    as: "postReferenced"
  });

  models.Users.belongsToMany(models.Posts, {
    through: {
      model: models.Likes,
      unique: false
    },
    foreignKey: "user_id",
    as: "likesPosts"
  });

  models.Users.hasMany(models.EmojiReactions, {
    foreignKey: "user_id",
    as: "emojiReactions"
  });

  models.Users.belongsToMany(models.Topics, {
    through: {
      model: models.Interests,
      unique: false
    },
    foreignKey: "user_id",
    as: "interestedTopics"
  });
}

function notificationAssociations(models: DbInterface) {
  models.Notifications.belongsTo(models.Users, { as: "user", foreignKey: "user_id" });
}
