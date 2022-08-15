import MongoDb from "mongodb"
import { MediaObjectV2, TweetV2, UserV2 } from "twitter-api-v2"

declare namespace TwitterTypes {
    type Tweet = {
        id: string
        tweet: TweetV2
        author: UserV2
        createdAt: Date
        medias?: MediaObjectV2[]
        inReplyTo?: UserV2
    }

    type TwitterData = {
        _id?: string
        lastId: string
    }

    type TwitterMongoData = {
        _id: MongoDb.ObjectId
        lastId: string
    }
}

export = TwitterTypes
