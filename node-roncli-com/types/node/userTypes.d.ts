import MongoDb from "mongodb"

declare namespace UserTypes {
    type SavedLoginMongoData = {
        _id?: MongoDb.ObjectId
        userId: MongoDb.ObjectId
        token: {
            salt: string
            hash: string
        }
        dateAdded: Date
    }

    type UserData = {
        _id?: string
        email: string
        dob: Date
        username: string
        password: {
            salt: string
            hash: string
        }
        dateValidated?: Date
        dateAdded: Date
        roles: string[]
    }

    type UserMongoData = {
        _id?: MongoDb.ObjectId
        email: string
        dob: Date
        username: string
        password: {
            salt: string
            hash: string
        }
        dateValidated?: Date
        dateAdded: Date
        roles: MongoDb.ObjectId[]
    }
}

export = UserTypes
