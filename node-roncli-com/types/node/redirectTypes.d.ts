import MongoDb from "mongodb"

declare namespace RedirectTypes {
    type RedirectData = {
        _id?: string
        fromPath: string
        toUrl: string
        dateAdded: Date
    }

    type RedirectMongoData = {
        _id?: MongoDb.ObjectId
        fromPath: string
        toUrl: string
        dateAdded: Date
    }
}

export = RedirectTypes
