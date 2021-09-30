import MongoDb from "mongodb"

declare namespace FeatureTypes {
    type FeatureData = {
        _id?: string
        url: string
        title: string
        section: string
        order: number
        dateAdded: Date
    }

    type FeatureMongoData = {
        _id?: MongoDb.ObjectId
        url: string
        title: string
        section: string
        order: number
        dateAdded: Date
    }
}

export = FeatureTypes
