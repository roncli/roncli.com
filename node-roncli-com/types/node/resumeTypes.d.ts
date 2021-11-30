import MongoDb from "mongodb"

declare namespace ResumeTypes {
    type ResumeData = {
        _id?: string
        resume: string
    }

    type ResumeMongoData = {
        _id: MongoDb.ObjectId
        resume: string
    }
}

export = ResumeTypes
