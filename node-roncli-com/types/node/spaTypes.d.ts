import Comment from "../../src/models/comment"

declare namespace SPATypes {
    type SPAData<T1, T2> = {
        title: string
        css: string[]
        js: string[]
        comments: Comment[]
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
