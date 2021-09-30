import Comment from "../../src/models/comment"

declare namespace SPATypes {
    type SPAData<T1, T2> = {
        css: string[]
        comments: Comment[]
        js: string[]
        views: {
            name: string
            path: string
        }[]
        view: string
        jsClass: string
        data?: T1
        info?: T2
    }
}

export = SPATypes
