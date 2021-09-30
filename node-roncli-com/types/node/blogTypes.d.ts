declare namespace BlogTypes {
    type Title = {
        blogSource: string
        id: string
        categories: string[]
        published: Date
        title: string
        url: string
    }
}

export = BlogTypes
