import MongoDb from "mongodb"

declare namespace CommentTypes {
    type CommentData = {
        _id?: string
        url: string
        comment: string
        dateAdded: Date
        userId: string
        username: string
        dateModerated?: Date
    }

    type CommentMongoData = {
        _id?: MongoDb.ObjectId
        url: string
        comment: string
        dateAdded: Date
        userId: MongoDb.ObjectId
        username?: string
        dateModerated?: Date
    }
}

export = CommentTypes
