import { DbInterface } from "util/typing/DbInterface";
import { HasOne, HasMany } from "sequelize/types/lib/associations";
import { PostInstance } from "./post";
import { DataContainerInstance } from "./data_container";
import { MultimediaInstance } from "./multimedia";

interface AssociationType {
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
    emojiReactionAssociations(models);
    metadataAssociations(models);
    multimediaAssociations(models);
    permissionAssociations(models);
    const postAssociations = postsAssociations(models);
    subtitleAssociations(models);
    tagAssociations(models);
    topicAssociations(models);
    threadAssociations(models);
    userAssociations(models);
    notificationAssociations(models);
    userGroupAssociations(models);
    multimediaInteractionsAssociations(models);
    searchQueryAssociations(models);
    internalNavigationStepAssociations(models);
    consentFormAssociations(models);
    asyncJobAssociations(models);

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
  models.AudioContent.hasMany(models.Metadata, { as: "metadatas", foreignKey: "audio_content_id" });
}

/**
 *  Create all DataContainer table relationship with rest of tables
 * @param models DbInterface
 */
function dataContainerAssociations(models: DbInterface) {
  models.DataContainer.belongsTo(models.Post, { as: "post", foreignKey: "post_id" });
  const DatacontainerMultimedia = models.DataContainer.hasMany(models.Multimedia, { as: "multimedia", foreignKey: "data_container_id" });

  return {
    DatacontainerMultimedia
  };
}

/**
 *  Create all EmojiReactions table relationship with rest of tables
 * @param models DbInterface
 */
function emojiReactionAssociations(models: DbInterface) {
  models.EmojiReaction.belongsTo(models.Multimedia, { as: "multimedia", foreignKey: "multimedia_id" });
  models.EmojiReaction.belongsTo(models.Users, { as: "user", foreignKey: "user_id" });
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
  models.Multimedia.hasMany(models.Subtitle, { as: "subtitles", foreignKey: "multimedia_id"});
  models.Multimedia.hasMany(models.MultimediaInteraction, { foreignKey: "multimedia_id" });
  models.Multimedia.hasMany(models.EmojiReaction, { as: "emojiReactions", foreignKey: "multimedia_id" });
  models.Multimedia.hasMany(models.AsyncJob, { foreignKey: "multimedia_id" });
}

/**
 *  Create all permissions table relationship with rest of tables
 * @param models DbInterface
 */
function postsAssociations(models: DbInterface) {
  const PostDataContainer = models.Post.hasOne(models.DataContainer, { as: "dataContainer", foreignKey: "post_id" });
  models.Post.hasMany(models.Post, { as: "comments", foreignKey: "parent_post_id" });
  models.Post.belongsTo(models.Users, { as: "user", foreignKey: "user_id" });
  models.Post.belongsTo(models.Threads, { as: "thread", foreignKey: "thread_id" });

  const optionsPostsPosts = {
    through: {
      model: models.PostReference,
      unique: false
    }
  };

  models.Post.belongsToMany(models.Post, Object.assign(optionsPostsPosts, {
    foreignKey: "post_references_id",
    as: "postReference"
  }));

  models.Post.belongsToMany(models.Post, Object.assign(optionsPostsPosts, {
    foreignKey: "post_referenced_id",
    as: "postReferenced"
  }));

  models.Post.belongsToMany(models.Users, {
    through: {
      model: models.UserReferences,
      unique: false
    },
    foreignKey: "post_id",
    as: "userReferenced"
  });

  models.Post.belongsToMany(models.Tags,{
    through: {
      model: models.TagReferences,
      unique: false
    },
    foreignKey: "post_id",
    as: "tags"
  });

  models.Post.belongsToMany(models.Users, {
    through: {
      model: models.Like,
      unique: false
    },
    foreignKey: "post_id",
    as: "likesUsers"
  });

  return {
    PostDataContainer
  };
}
/**
 *  Create all permissions table relationship with rest of tables
 * @param models DbInterface
 */
function permissionAssociations(models: DbInterface): void {
  models.Permission.belongsToMany(models.Users, {
    through: "user_permissions"
  });
}

/**
 *  Create all subtitle table relationship with rest of tables
 * @param models DbInterface
 */
function subtitleAssociations(models: DbInterface): void {
  models.Subtitle.belongsTo(models.Multimedia, { as: "multimedia", foreignKey: "multimedia_id" });
}

/**
 *  Create all tag table relationship with rest of tables
 * @param models DbInterface
 */
function tagAssociations(models: DbInterface): void {
  models.Tags.belongsToMany(models.Post, {
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
  models.Topics.belongsTo(models.UserGroup);
  models.Topics.hasMany(models.Threads, { as: "threads", foreignKey: "topic_id" });
  models.Topics.belongsToMany(models.Users, {
    through: {
      model: models.Interest,
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
  models.Threads.hasMany(models.Post, { as: "post", foreignKey: "thread_id" });
}

/**
 *  Create all users table relationship with rest of tables
 * @param models DbInterface
 */
function userAssociations(models: DbInterface): void {
  models.Users.hasMany(models.Multimedia, { as: "multimedia", foreignKey: "user_id" });
  models.Users.belongsTo(models.Preference, { as: "preferences", foreignKey: "preferences_id" });
  models.Users.hasMany(models.Post, { as: "post", foreignKey: "user_id" });
  models.Users.hasMany(models.Notification, { as: "notifications", foreignKey: "user_id" });
  models.Users.hasMany(models.MultimediaInteraction);
  models.Users.hasMany(models.SearchQuery);
  models.Users.hasMany(models.InternalNavigationStep);
  models.Users.hasMany(models.ConsentForm);
  models.Users.belongsToMany(models.UserGroup, { through: "user_group_users" });

  models.Users.belongsToMany(models.Permission, {
    through: "user_permissions"
  });

  models.Users.belongsToMany(models.Post, {
    through: {
      model: models.UserReferences,
      unique: false
    },
    foreignKey: "user_id",
    as: "postReferenced"
  });

  models.Users.belongsToMany(models.Post, {
    through: {
      model: models.Like,
      unique: false
    },
    foreignKey: "user_id",
    as: "likesPosts"
  });

  models.Users.hasMany(models.EmojiReaction, {
    foreignKey: "user_id",
    as: "emojiReactions"
  });

  models.Users.belongsToMany(models.Topics, {
    through: {
      model: models.Interest,
      unique: false
    },
    foreignKey: "user_id",
    as: "interestedTopics"
  });
}

/**
 * Create associations for the user_groups table
 * @param models DBInterface
 */
function userGroupAssociations(models: DbInterface) {
  models.UserGroup.belongsToMany(models.Users, { through: "user_group_users" });
  models.UserGroup.hasMany(models.Topics);
}

/**
 * Create associations for the user_groups table
 * @param models DBInterface
 */
function multimediaInteractionsAssociations(models: DbInterface) {
  models.MultimediaInteraction.belongsTo(models.Users);
  models.MultimediaInteraction.belongsTo(models.Multimedia, { foreignKey: "multimedia_id" });
}

/**
 * Create associations for the notifications table
 * @param models DBInterface
 */
function notificationAssociations(models: DbInterface) {
  models.Notification.belongsTo(models.Users, { as: "user", foreignKey: "user_id" });
}

/**
 * Create associations for the search_queries table
 * @param models DBInterface
 */
function searchQueryAssociations(models: DbInterface) {
  models.SearchQuery.belongsTo(models.Users);
}

/**
 * Create associations for the internal_navigation_steps table
 * @param models DBInterface
 */
function internalNavigationStepAssociations(models: DbInterface) {
  models.InternalNavigationStep.belongsTo(models.Users);
}

/**
 * Create associations for the consent_forms table
 * @param models DBInterface
 */
function consentFormAssociations(models: DbInterface) {
  models.ConsentForm.belongsTo(models.Users);
}

/**
 * Create associations for the async_jobs table
 * @param models DBInterface
 */
function asyncJobAssociations(models: DbInterface) {
  models.AsyncJob.belongsTo(models.Multimedia, { foreignKey: "multimedia_id" });
}
