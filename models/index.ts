import { Sequelize } from "sequelize";

import { DbInterface } from "util/typing/DbInterface";
import association from "./associations";

import { MediaItemModelFactory } from "./media_item";
import { TopicModelFactory } from "./topic";
import { ThreadModelFactory } from "./thread";
import { TagModelFactory } from "./tag";
import { TagReferenceModelFactory } from "./tag_reference";
import { PermissionModelFactory } from "./permission";
import { PostModelFactory } from "./post";
import { PostReferenceModelFactory } from "./post_reference";
import { UserModelFactory } from "./user";
import { UserReferenceModelFactory } from "./user_reference";
import { DataContainerModelFactory } from "./data_container";
import { AudioContentModelFactory } from "./audio_content";
import { MetadataItemModelFactory } from "./metadata_item";
import { SubtitleModelFactory } from "./subtitle";
import { LikeModelFactory } from "./like";
import { EmojiReactionModelFactory } from "./emoji_reaction";
import { InterestModelFactory } from "./interest";
import { NotificationModelFactory } from "./notification";
import { UserGroupModelFactory } from "./user_group";
import { MultimediaInteractionModelFactory } from "./multimedia_interaction";
import { SearchQueryModelFactory } from "./search_query";
import { InternalNavigationStepModelFactory } from "./internal_navigation_step";
import { ConsentFormModelFactory } from "./consent_form";
import { AsyncJobModelFactory } from "./async_job";
import { UserPermissionModelFactory } from "./user_permission";

/**
 *  Class that contains all models created in the data base. Also, it is charge of
 *  building all models and syncronice with the database.
 */
class DataBase {

  private models: DbInterface; // All models that exists in the DB.

  getModels(): DbInterface {
    return this.models;
  }

  /**
   *  Create all models in the database and return them
   * @param sequelize Sequelize: Conection object with de database
   */
  createModels(sequelize: Sequelize): void {
    const AsyncJob = AsyncJobModelFactory(sequelize);
    const AudioContent = AudioContentModelFactory(sequelize);
    const ConsentForm = ConsentFormModelFactory(sequelize);
    const DataContainer = DataContainerModelFactory(sequelize);
    const EmojiReaction = EmojiReactionModelFactory(sequelize);
    const Interest = InterestModelFactory(sequelize);
    const InternalNavigationStep = InternalNavigationStepModelFactory(sequelize);
    const Like = LikeModelFactory(sequelize);
    const MetadataItem = MetadataItemModelFactory(sequelize);
    const MediaItem = MediaItemModelFactory(sequelize);
    const MultimediaInteraction = MultimediaInteractionModelFactory(sequelize);
    const Notification = NotificationModelFactory(sequelize);
    const Permission = PermissionModelFactory(sequelize);
    const PostReference = PostReferenceModelFactory(sequelize);
    const Post = PostModelFactory(sequelize);
    const SearchQuery = SearchQueryModelFactory(sequelize);
    const Subtitle = SubtitleModelFactory(sequelize);
    const TagReference = TagReferenceModelFactory(sequelize);
    const Tag = TagModelFactory(sequelize);
    const Thread = ThreadModelFactory(sequelize);
    const Topic = TopicModelFactory(sequelize);
    const UserGroup = UserGroupModelFactory(sequelize);
    const UserReference = UserReferenceModelFactory(sequelize);
    const User = UserModelFactory(sequelize);
    const UserPermission = UserPermissionModelFactory(sequelize);

    this.models = {
      AsyncJob,
      AudioContent,
      ConsentForm,
      DataContainer,
      EmojiReaction,
      Interest,
      InternalNavigationStep,
      Like,
      MetadataItem,
      MediaItem,
      MultimediaInteraction,
      Notification,
      Permission,
      PostReference,
      Post,
      SearchQuery,
      Subtitle,
      TagReference,
      Tag,
      Thread,
      Topic,
      UserGroup,
      UserReference,
      User,
      UserPermission
    };
  }

  /**
   *  Calls all methods to create the models and them relationships and syncronize it with the database
   * @param sequelize Sequelize: Conection object with de database
   */
  async createDB(sequelize: Sequelize): Promise<DbInterface> {
    // Create the models
    this.createModels(sequelize);

    // Create all relationships between models
    association.createAssociations(this.models);

    // Synchronize with physical database (If the models not exists in the database, they are created)
    await sequelize.sync();

    return this.models;
  }
}

export const db = new DataBase();

