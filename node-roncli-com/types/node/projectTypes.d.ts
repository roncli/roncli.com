import MongoDb from "mongodb"

declare namespace ProjectTypes {
    type ProjectData = {
        _id?: string
        url: string
        title: string
        projectUrl?: string
        github: {
            user: string
            repository: string
        }
        description?: string
        order?: number
        dateAdded?: Date
        dateUpdated?: Date
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
        dateAdded: Date
        dateUpdated: Date
    }

    type RepositoryData = {
        repository: {
            url: string
            primaryLanguage: string
            createdAt: Date
            updatedAt: Date
            description: string
        }
        releases: {
            name: string
            body: string
            createdAt: Date
            url: string
        }[]
        commits: {
            author: string
            committer: string
            description: string
            createdAt: Date
            url: string
            sha: string
        }[]
    }
}

export = ProjectTypes
