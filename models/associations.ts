import { DbInterface } from "util/typing/DbInterface";
import { HasOne, HasMany } from "sequelize/types/lib/associations";
import { PostInstance } from "./post";
import { DataContainerInstance } from "./data_container";
import { MediaItemInstance } from "./media_item";

interface AssociationType {
  datacontainerAssociations: {
    DatacontainerMultimedia: HasMany<DataContainerInstance, MediaItemInstance>
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
  models.AudioContent.belongsTo(models.MediaItem);
  models.AudioContent.hasMany(models.MetadataItem);
}

/**
 *  Create all DataContainer table relationship with rest of tables
 * @param models DbInterface
 */
function dataContainerAssociations(models: DbInterface) {
  models.DataContainer.belongsTo(models.Post);
  const DatacontainerMultimedia = models.DataContainer.hasMany(models.MediaItem);

  return {
    DatacontainerMultimedia
  };
}

/**
 *  Create all EmojiReactions table relationship with rest of tables
 * @param models DbInterface
 */
function emojiReactionAssociations(models: DbInterface) {
  models.EmojiReaction.belongsTo(models.MediaItem);
  models.EmojiReaction.belongsTo(models.User);
}

/**
 *  Create all metadata table relationship with rest of tables
 * @param models DbInterface
 */
function metadataAssociations(models: DbInterface): void {
  models.MetadataItem.belongsTo(models.MediaItem);
  models.MetadataItem.belongsTo(models.AudioContent);
}

/**
 *  Create all multimedia table relationship with rest of tables
 * @param models DbInterface
 */
function multimediaAssociations(models: DbInterface): void {
  models.MediaItem.belongsTo(models.User);
  models.MediaItem.belongsTo(models.DataContainer);
  models.MediaItem.hasMany(models.AudioContent);
  models.MediaItem.hasMany(models.MetadataItem);
  models.MediaItem.hasMany(models.Subtitle);
  models.MediaItem.hasMany(models.MultimediaInteraction);
  models.MediaItem.hasMany(models.EmojiReaction);
  models.MediaItem.hasMany(models.AsyncJob);
}

/**
 *  Create all permissions table relationship with rest of tables
 * @param models DbInterface
 */
function postsAssociations(models: DbInterface) {
  const PostDataContainer = models.Post.hasOne(models.DataContainer);
  models.Post.hasMany(models.Post, { as: "comments", foreignKey: "parent_post_id" });
  models.Post.belongsTo(models.User);
  models.Post.belongsTo(models.Thread);

  const optionsPostsPosts = {
    through: {
      model: models.PostReference,
      unique: false
    }
  };

  models.Post.belongsToMany(models.Post, Object.assign(optionsPostsPosts, {
    foreignKey: "post_references_id",
    as: "postReferences"
  }));

  models.Post.belongsToMany(models.Post, Object.assign(optionsPostsPosts, {
    foreignKey: "post_referenced_id",
    as: "postReferenced"
  }));

  models.Post.belongsToMany(models.User, {
    through: {
      model: models.UserReference,
      unique: false
    },
    foreignKey: "post_id",
    as: "userReferenced"
  });

  models.Post.belongsToMany(models.Tag,{
    through: {
      model: models.TagReference,
      unique: false
    },
    foreignKey: "post_id"
  });

  models.Post.belongsToMany(models.User, {
    through: {
      model: models.Like,
      unique: false
    },
    foreignKey: "post_id",
    as: "likedUsers"
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
  models.Permission.belongsToMany(models.User, {
    through: "user_permissions"
  });
}

/**
 *  Create all subtitle table relationship with rest of tables
 * @param models DbInterface
 */
function subtitleAssociations(models: DbInterface): void {
  models.Subtitle.belongsTo(models.MediaItem);
}

/**
 *  Create all tag table relationship with rest of tables
 * @param models DbInterface
 */
function tagAssociations(models: DbInterface): void {
  models.Tag.belongsToMany(models.Post, {
    through: {
      model: models.TagReference,
      unique: false
    },
    foreignKey: "tag_id"
  });
}

/**
 *  Create all topic table relationship with rest of tables
 * @param models DbInterface
 */
function topicAssociations(models: DbInterface): void {
  models.Topic.belongsTo(models.UserGroup);
  models.Topic.hasMany(models.Thread);

  models.Topic.belongsToMany(models.User, {
    through: {
      model: models.Interest,
      unique: false
    },
    foreignKey: "topic_id",
    as: "interestedUsers"
  });
}

/**
 *  Create all thread table relationship with rest of tables
 * @param models DbInterface
 */
function threadAssociations(models: DbInterface): void {
  models.Thread.belongsTo(models.Topic);
  models.Thread.hasMany(models.Post);
}

/**
 *  Create all users table relationship with rest of tables
 * @param models DbInterface
 */
function userAssociations(models: DbInterface): void {
  models.User.hasMany(models.MediaItem);
  models.User.hasMany(models.Post);
  models.User.hasMany(models.Notification);
  models.User.hasMany(models.MultimediaInteraction);
  models.User.hasMany(models.SearchQuery);
  models.User.hasMany(models.InternalNavigationStep);
  models.User.hasMany(models.ConsentForm);
  models.User.hasMany(models.EmojiReaction);

  models.User.belongsToMany(models.UserGroup, {
    through: "user_group_users"
  });

  models.User.belongsToMany(models.Permission, {
    through: "user_permissions"
  });

  models.User.belongsToMany(models.Post, {
    through: {
      model: models.UserReference,
      unique: false
    },
    foreignKey: "user_id",
    as: "postReferenced"
  });

  models.User.belongsToMany(models.Post, {
    through: {
      model: models.Like,
      unique: false
    },
    foreignKey: "user_id",
    as: "likedPosts"
  });

  models.User.belongsToMany(models.Topic, {
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
  models.UserGroup.belongsToMany(models.User, { through: "user_group_users" });
  models.UserGroup.hasMany(models.Topic);
}

/**
 * Create associations for the user_groups table
 * @param models DBInterface
 */
function multimediaInteractionsAssociations(models: DbInterface) {
  models.MultimediaInteraction.belongsTo(models.User);
  models.MultimediaInteraction.belongsTo(models.MediaItem);
}

/**
 * Create associations for the notifications table
 * @param models DBInterface
 */
function notificationAssociations(models: DbInterface) {
  models.Notification.belongsTo(models.User);
}

/**
 * Create associations for the search_queries table
 * @param models DBInterface
 */
function searchQueryAssociations(models: DbInterface) {
  models.SearchQuery.belongsTo(models.User);
}

/**
 * Create associations for the internal_navigation_steps table
 * @param models DBInterface
 */
function internalNavigationStepAssociations(models: DbInterface) {
  models.InternalNavigationStep.belongsTo(models.User);
}

/**
 * Create associations for the consent_forms table
 * @param models DBInterface
 */
function consentFormAssociations(models: DbInterface) {
  models.ConsentForm.belongsTo(models.User);
}

/**
 * Create associations for the async_jobs table
 * @param models DBInterface
 */
function asyncJobAssociations(models: DbInterface) {
  models.AsyncJob.belongsTo(models.MediaItem);
}
