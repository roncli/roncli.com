import MongoDb from "mongodb"

declare namespace MastodonTypes {
    type MastodonData = {
        _id?: string
        lastId: string
    }

    type MastodonMongoData = {
        _id: MongoDb.ObjectId
        lastId: string
    }
}

export = MastodonTypes
