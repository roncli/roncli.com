import { AllowedPlaylistData } from "./allowedPlaylistTypes"
import { ChangeAuthorizationMongoData } from "./changeAuthorizationTypes"
import { CommentMongoData } from "./commentTypes"
import { ContactMongoData } from "./contactTypes"
import { FeatureMongoData } from "./featureTypes"
import { PageMongoData } from "./pageTypes"
import { ProjectMongoData } from "./projectTypes"
import { RedirectMongoData } from "./redirectTypes"
import { RoleMongoData } from "./roleTypes"
import { SavedLoginMongoData, UserMongoData } from "./userTypes"
import MongoDb from "mongodb"

declare module "mongodb" {
    export interface Db {
        collection<TSchema = AllowedPlaylistData>(name: "allowedPlaylist", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = ChangeAuthorizationMongoData>(name: "changeAuthorization", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = CommentMongoData>(name: "comment", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = ContactMongoData>(name: "contact", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = FeatureMongoData>(name: "feature", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = PageMongoData>(name: "page", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = ProjectMongoData>(name: "project", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = RedirectMongoData>(name: "redirect", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = RoleMongoData>(name: "role", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = SavedLoginMongoData>(name: "savedLogin", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = UserMongoData>(name: "user", options?: CollectionOptions): Collection<TSchema>
    }

    // The default implementation of aggregate's generic (<T = Document>) is too restrictive, so we change it here to suit our needs.
    export interface Collection {
        aggregate<T = any>(pipeline?: MongoDb.Document[], options?: AggregateOptions): AggregationCursor<T>;
    }
}
