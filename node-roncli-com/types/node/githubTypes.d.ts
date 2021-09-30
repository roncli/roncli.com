declare namespace GithubTypes {
    type Commit = EventBase & {
        pushId: number
        sha: string
        message: string
        author: {
            name: string
            email: string
        }
        url: string
        distinct: boolean
        createdAt: Date
    }

    type Event = EventBase & {
        type: string
        payload: any
        public: boolean
        created_at: string
    }

    type Release = EventBase & {
        action: string
        url: string
        releaseId: number
        name: string
        tagName: string
        body: string
        draft: boolean
        createdAt: Date
    }

    type EventBase = {
        id: string
        repo: {
            id: number
            name: string
            url: string
        }
        actor: {
            id: number
            login: string
            display_login?: string
            gravatar_id: string
            url: string
            avatar_url: string
        }
        org?: {
            id: number
            login: string
            gravatar_id: string
            url: string
            avatar_url: string
        }
    }
}

export = GithubTypes
