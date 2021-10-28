import { Sequelize } from "sequelize";

import { DbInterface } from "util/typing/DbInterface";
import association from "./associations";

import { MultimediaModelFactory } from "./multimedia";
import { TopicModelFactory } from "./topic";
import { ThreadModelFactory } from "./thread";
import { TagModelFactory } from "./tag";
import { TagReferencesModelFactory } from "./tag_references";
import { PermissionsModelFactory } from "./permissions";
import { PostModelFactory } from "./post";
import { PostReferencesModelFactory } from "./post_references";
import { PreferencesModelFactory } from "./preferences";
import { UsersModelFactory } from "./users";
import { UserReferencesModelFactory } from "./user_references";
import { DataContainerModelFactory } from "./data_container";
import { AudioContentModelFactory } from "./audio_content";
import { MetadataModelFactory } from "./metadata";
import { SubtitlesModelFactory } from "./subtitles";
import { LikesModelFactory } from "./likes";
import { EmojiReactionModelFactory } from "./emoji_reaction";
import { InterestModelFactory } from "./interest";
import { NotificationsModelFactory } from "./notifications";
import { UserGroupModelFactory } from "./user_group";
import { MultimediaInteractionModelFactory } from "./multimedia_interaction";
import { SearchQueryModelFactory } from "./search_query";
import { InternalNavigationStepModelFactory } from "./internal_navigation_step";
import { ConsentFormModelFactory } from "./consent_form";
import { AsyncJobModelFactory } from "./async_job";

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
    const Likes = LikesModelFactory(sequelize);
    const Metadata = MetadataModelFactory(sequelize);
    const Multimedia = MultimediaModelFactory(sequelize);
    const MultimediaInteraction = MultimediaInteractionModelFactory(sequelize);
    const Notifications = NotificationsModelFactory(sequelize);
    const Permissions = PermissionsModelFactory(sequelize);
    const PostReferences = PostReferencesModelFactory(sequelize);
    const Posts = PostModelFactory(sequelize);
    const Preferences = PreferencesModelFactory(sequelize);
    const SearchQuery = SearchQueryModelFactory(sequelize);
    const Subtitles = SubtitlesModelFactory(sequelize);
    const TagReferences = TagReferencesModelFactory(sequelize);
    const Tags = TagModelFactory(sequelize);
    const Threads = ThreadModelFactory(sequelize);
    const Topics = TopicModelFactory(sequelize);
    const UserGroup = UserGroupModelFactory(sequelize);
    const UserReferences = UserReferencesModelFactory(sequelize);
    const Users = UsersModelFactory(sequelize);

    this.models = {
      AsyncJob,
      AudioContent,
      ConsentForm,
      DataContainer,
      EmojiReaction,
      Interest,
      InternalNavigationStep,
      Likes,
      Metadata,
      Multimedia,
      MultimediaInteraction,
      Notifications,
      Permissions,
      PostReferences,
      Posts,
      Preferences,
      SearchQuery,
      Subtitles,
      TagReferences,
      Tags,
      Threads,
      Topics,
      UserGroup,
      UserReferences,
      Users,
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

