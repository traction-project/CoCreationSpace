import { ModelCtor } from "sequelize";

import { AudioContentInstance } from "models/audio_content";
import { DataContainerInstance } from "models/data_container";
import { MetadataInstance } from "models/metadata";
import { MultimediaInstance } from "models/multimedia";
import { PermissionsInstance } from "models/permissions";
import { PostInstance } from "models/post";
import { PreferencesInstance } from "models/preferences";
import { SubtitlesInstance } from "models/subtitles";
import { TagInstance } from "models/tag";
import { TagReferencesInstance } from "models/tag_references";
import { ThreadInstance } from "models/thread";
import { TopicInstance } from "models/topic";
import { UserInstance } from "models/users";
import { UserReferencesInstance } from "models/user_references";
import { PostReferencesInstance } from "models/post_references";
import { LikesInstance } from "models/likes";
import { EmojiReactionInstance } from "models/emoji_reaction";
import { InterestInstance } from "models/interest";
import { NotificationInstance } from "models/notifications";
import { UserGroupInstance } from "models/user_group";
import { MultimediaInteractionInstance } from "models/multimedia_interaction";
import { SearchQueryInstance } from "models/search_query";
import { InternalNavigationStepInstance } from "models/internal_navigation_step";
import { ConsentFormInstance } from "models/consent_form";
import { AsyncJobInstance } from "models/async_job";

/**
 *  Interface for the objects that containes all models from database
 */
export interface DbInterface {
    AsyncJob: ModelCtor<AsyncJobInstance>;
    AudioContent: ModelCtor<AudioContentInstance>;
    ConsentForm: ModelCtor<ConsentFormInstance>;
    DataContainer: ModelCtor<DataContainerInstance>;
    EmojiReaction: ModelCtor<EmojiReactionInstance>;
    Interest: ModelCtor<InterestInstance>;
    InternalNavigationStep: ModelCtor<InternalNavigationStepInstance>;
    Likes: ModelCtor<LikesInstance>;
    Metadata: ModelCtor<MetadataInstance>;
    Multimedia: ModelCtor<MultimediaInstance>;
    MultimediaInteraction: ModelCtor<MultimediaInteractionInstance>;
    Notifications: ModelCtor<NotificationInstance>;
    Permissions: ModelCtor<PermissionsInstance>;
    PostReferences: ModelCtor<PostReferencesInstance>;
    Posts: ModelCtor<PostInstance>;
    Preferences: ModelCtor<PreferencesInstance>;
    SearchQuery: ModelCtor<SearchQueryInstance>;
    Subtitles: ModelCtor<SubtitlesInstance>;
    TagReferences: ModelCtor<TagReferencesInstance>;
    Tags: ModelCtor<TagInstance>;
    Threads: ModelCtor<ThreadInstance>;
    Topics: ModelCtor<TopicInstance>;
    UserGroup: ModelCtor<UserGroupInstance>;
    UserReferences: ModelCtor<UserReferencesInstance>;
    Users: ModelCtor<UserInstance>;
}
