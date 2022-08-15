declare namespace MicroblogTypes {
    type MicroblogData = {
        url: string
        name: string
        username: string
        avatarUrl: string
        profileUrl: string
        inReplyToUsername: string
        inReplyToUrl: string
        post: string
        createdAt: Date
        displayDate: Date
        media: {
            type: string
            url: string
        }[]
    }
}

export = MicroblogTypes
