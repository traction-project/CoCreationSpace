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
import { EmojiReactionsModelFactory } from "./emoji_reactions";
import { InterestModelFactory } from "./interest";
import { NotificationsModelFactory } from "./notifications";

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
    const AudioContent = AudioContentModelFactory(sequelize);
    const DataContainer = DataContainerModelFactory(sequelize);
    const EmojiReactions = EmojiReactionsModelFactory(sequelize);
    const Interests = InterestModelFactory(sequelize);
    const Likes = LikesModelFactory(sequelize);
    const Metadata = MetadataModelFactory(sequelize);
    const Multimedia = MultimediaModelFactory(sequelize);
    const Notifications = NotificationsModelFactory(sequelize);
    const Permissions = PermissionsModelFactory(sequelize);
    const Posts = PostModelFactory(sequelize);
    const PostReferences = PostReferencesModelFactory(sequelize);
    const Preferences = PreferencesModelFactory(sequelize);
    const Subtitles = SubtitlesModelFactory(sequelize);
    const Tags = TagModelFactory(sequelize);
    const TagReferences = TagReferencesModelFactory(sequelize);
    const Threads = ThreadModelFactory(sequelize);
    const Topics = TopicModelFactory(sequelize);
    const Users = UsersModelFactory(sequelize);
    const UserReferences = UserReferencesModelFactory(sequelize);

    this.models = {
      AudioContent,
      DataContainer,
      EmojiReactions,
      Interests,
      Likes,
      Metadata,
      Multimedia,
      Notifications,
      Permissions,
      Posts,
      PostReferences,
      Preferences,
      Subtitles,
      Tags,
      TagReferences,
      Threads,
      Topics,
      Users,
      UserReferences
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

