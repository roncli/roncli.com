import MongoDb from "mongodb"

declare namespace ChangeAuthorizationTypes {
    type ChangeAuthorizationData = {
        _id?: string
        userId: string
        type: "password" | "emailChange" | "emailValidate" | "register"
        authorization: {
            salt: string
            hash: string
        }
        data?: object
        dateAdded: Date
    }

    type ChangeAuthorizationMongoData = {
        _id?: MongoDb.ObjectId
        userId: MongoDb.ObjectId
        type: "password" | "emailChange" | "emailValidate" | "register"
        authorization: {
            salt: string
            hash: string
        }
        data?: object
        dateAdded: Date
    }
}

export = ChangeAuthorizationTypes
