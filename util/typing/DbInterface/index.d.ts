import { ModelCtor } from "sequelize";

import { AudioContentInstance } from "models/audio_content";
import { DataContainerInstance } from "models/data_container";
import { MetadataInstance } from "models/metadata";
import { MultimediaInstance } from "models/multimedia";
import { PermissionInstance } from "models/permission";
import { PostInstance } from "models/post";
import { PreferenceInstance } from "models/preference";
import { SubtitleInstance } from "models/subtitle";
import { TagInstance } from "models/tag";
import { TagReferenceInstance } from "models/tag_reference";
import { ThreadInstance } from "models/thread";
import { TopicInstance } from "models/topic";
import { UserInstance } from "models/user";
import { UserReferenceInstance } from "models/user_reference";
import { PostReferenceInstance } from "models/post_reference";
import { LikeInstance } from "models/like";
import { EmojiReactionInstance } from "models/emoji_reaction";
import { InterestInstance } from "models/interest";
import { NotificationInstance } from "models/notification";
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
    Like: ModelCtor<LikeInstance>;
    Metadata: ModelCtor<MetadataInstance>;
    Multimedia: ModelCtor<MultimediaInstance>;
    MultimediaInteraction: ModelCtor<MultimediaInteractionInstance>;
    Notification: ModelCtor<NotificationInstance>;
    Permission: ModelCtor<PermissionInstance>;
    PostReference: ModelCtor<PostReferenceInstance>;
    Post: ModelCtor<PostInstance>;
    Preference: ModelCtor<PreferenceInstance>;
    SearchQuery: ModelCtor<SearchQueryInstance>;
    Subtitle: ModelCtor<SubtitleInstance>;
    TagReference: ModelCtor<TagReferenceInstance>;
    Tag: ModelCtor<TagInstance>;
    Thread: ModelCtor<ThreadInstance>;
    Topic: ModelCtor<TopicInstance>;
    UserGroup: ModelCtor<UserGroupInstance>;
    UserReference: ModelCtor<UserReferenceInstance>;
    User: ModelCtor<UserInstance>;
}
