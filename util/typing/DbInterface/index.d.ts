import { ModelCtor } from "sequelize";

import { AudioContentInstance } from "models/audioContent";
import { DataContainerInstance } from "models/dataContainer";
import { MetadataInstance } from "models/metadata";
import { MultimediaInstance } from "models/multimedia";
import { PermissionsInstance } from "models/permissions";
import { PostInstance } from "models/post";
import { PreferencesInstance } from "models/preferences";
import { SubtitlesInstance } from "models/subtitles";
import { TagInstance } from "models/tag";
import { TagReferencesInstance } from "models/tagReferences";
import { ThreadInstance } from "models/thread";
import { TopicInstance } from "models/topic";
import { UserInstance } from "models/users";
import { UserReferencesInstance } from "models/userReferences";
import { PostReferencesInstance } from "models/postReferences";
import { LikesInstance } from "models/likes";

/**
 *  Interface for the objects that containes all models from database
 */
export interface DbInterface {
    AudioContent: ModelCtor<AudioContentInstance>;
    DataContainer: ModelCtor<DataContainerInstance>;
    Likes: ModelCtor<LikesInstance>;
    Metadata: ModelCtor<MetadataInstance>;
    Multimedia: ModelCtor<MultimediaInstance>;
    Permissions: ModelCtor<PermissionsInstance>;
    Posts: ModelCtor<PostInstance>;
    PostReferences: ModelCtor<PostReferencesInstance>;
    Preferences: ModelCtor<PreferencesInstance>;
    Subtitles: ModelCtor<SubtitlesInstance>;
    Tags: ModelCtor<TagInstance>;
    TagReferences: ModelCtor<TagReferencesInstance>;
    Threads: ModelCtor<ThreadInstance>;
    Topics: ModelCtor<TopicInstance>;
    Users: ModelCtor<UserInstance>;
    UserReferences: ModelCtor<UserReferencesInstance>;
}