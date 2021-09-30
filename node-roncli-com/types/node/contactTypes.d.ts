import MongoDb from "mongodb"

declare namespace ContactTypes {
    type ContactData = {
        _id?: string
        title: string
        value: string
    }

    type ContactMongoData = {
        _id?: MongoDb.ObjectId
        title: string
        value: string
    }
}

export = ContactTypes
