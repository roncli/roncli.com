import MongoDb from "mongodb"
import Entity from "megalodon"

declare namespace MastodonTypes {
    type MastodonData = {
        _id?: string
        lastId: string
    }

    type MastodonMongoData = {
        _id: MongoDb.ObjectId
        lastId: string
    }

    type Post = {
        id: string
        post: Entity.Status
        createdAt: Date
    }
}

export = MastodonTypes
