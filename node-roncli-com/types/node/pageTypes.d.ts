import MongoDb from "mongodb"

declare namespace PageTypes {
    type PageData = {
        _id?: string
        url: string
        parentPageId?: string
        order?: number
        title: string
        shortTitle: string
        page: string
        dateAdded: Date
        dateUpdated: Date
    }

    type PageMetadata = {
        id: string
        url: string
        parentPageId?: string
        title: string
        shortTitle: string
        order?: number
    }

    type PageMongoData = {
        _id?: MongoDb.ObjectId
        url: string
        parentPageId?: MongoDb.ObjectId
        order?: number
        title: string
        shortTitle: string
        page: string
        dateAdded: Date
        dateUpdated: Date
    }

    type PageTitle = {
        url: string
        shortTitle: string
    }
}

export = PageTypes
