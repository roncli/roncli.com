import { RedirectMongoData } from "./redirectTypes"

declare module "mongodb" {
    export interface Db {
        collection<TSchema = RedirectMongoData>(name: "redirect", options?: CollectionOptions): Collection<TSchema>
    }
}
