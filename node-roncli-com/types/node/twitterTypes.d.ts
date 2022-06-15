import MongoDb from "mongodb"

declare namespace TwitterTypes {
    type TwitterData = {
        _id?: string
        lastId: string
    }

    type TwitterMongoData = {
        _id: MongoDb.ObjectId
        lastId: string
    }
}

export = TwitterTypes
