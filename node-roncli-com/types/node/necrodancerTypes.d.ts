declare namespace NecroDancerTypes {
    type RunData = {
        name: string
        rank: number
        score: number
        run: string
        end: {
            zone: number
            level: number
        }
        url: string
    }

    type Tag = {
        name: string
        slug: string
    }

    type TagType = Tag & {
        tags: Tag[]
    }
}

export = NecroDancerTypes
