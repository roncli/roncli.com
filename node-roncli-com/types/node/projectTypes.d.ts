import MongoDb from "mongodb"

declare namespace ProjectTypes {
    type ProjectData = {
        _id?: string
        url: string
        title: string
        projectUrl: string
        github: {
            user: string
            repository: string
        }
        description: string
        order: number
        dateAdded: string
        dateUpdated: string
    }

    type ProjectMongoData = {
        _id: MongoDb.ObjectId
        url: string
        title: string
        projectUrl: string
        github: {
            user: string
            repository: string
        }
        description: string
        order: number
        dateAdded: string
        dateUpdated: string
    }
}

export = ProjectTypes
