import MongoDb from "mongodb"

declare namespace RoleTypes {
    type RoleData = {
        _id?: string
        role: string
        dateAdded: Date
    }

    type RoleMongoData = {
        _id?: MongoDb.ObjectId
        role: string
        dateAdded: Date
    }
}

export = RoleTypes
