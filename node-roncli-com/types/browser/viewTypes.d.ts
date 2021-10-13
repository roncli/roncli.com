import AllowedPlaylist from "../../src/models/allowedPlaylist"
import BlogTypes from "../node/blogTypes"
import Comment from "../../src/models/comment"
import Contact from "../../src/models/contact"
import Feature from "../../src/models/feature"
import GithubTypes from "../node/githubTypes"
import NecroDancer from "../../src/models/necrodancer"
import Page from "../../src/models/page"
import PageTypes from "../node/pageTypes"
import Playlist from "../../src/models/playlist"
import ProfileTypes from "../node/profileTypes"
import Redirect from "../../src/models/redirect"
import Speedrun from "../../src/models/speedrun"
import Track from "../../src/models/track"
import User from "../../src/models/user"

declare namespace ViewTypes {
    type AdminFilesViewParameters = {
        path: string
        entries: {
            name: string
            size: number
            date: Date
        }[]
    }

    type AdminFrontPageViewParameters = {
        music: Feature[]
        coding: Feature[]
        gaming: Feature[]
        life: Feature[]
    }

    type AdminModerationViewParameters = {
        comments: Comment[]
    }

    type AdminPageViewParameters = {
        page: Page
        childPages: PageTypes.PageMetadata[]
        otherPages: PageTypes.PageMetadata[]
    }

    type AdminPagesViewParameters = {
        topLevelPages: PageTypes.PageMetadata[]
        otherPages: PageTypes.PageMetadata[]
    }

    type AdminRedirectsViewParameters = {
        redirects: Redirect[]
    }

    type AdminViewParameters = {
        commentsToModerate: number
    }

    type AdminYouTubeViewParameters = {
        playlists: AllowedPlaylist[]
    }

    type BlogCategoryViewParameters = {
        category: string
        titles: BlogTypes.Title[]
        categories: {
            category: string
            posts: number
        }[]
        count: number
        pageSize: number
        newestDate: string
    }

    type BlogCategoryViewInfoParameters = {
        category: string
        categories: {
            category: string
            posts: number
        }[]
    }

    type BlogPostViewParameters = {
        title: BlogTypes.Title
        content: any
        mainNav: {
            prev: BlogTypes.Title
            next: BlogTypes.Title
        }
        categoryNavs: {
            [x: string]: {
                prev: BlogTypes.Title
                next: BlogTypes.Title
            }
        }
        category: string
    }

    type BlogPostViewInfoParameters = {
        title: BlogTypes.Title
        category: string
        categories: {
            category: string
            posts: number
        }[]
    }

    type BlogViewParameters = {
        titles: BlogTypes.Title[]
        categories: {
            category: string
            posts: number
        }[]
        count: number
        pageSize: number
        newestDate: string
    }

    type BlogViewInfoParameters = {
        categories: {
            category: string
            posts: number
        }[]
    }

    type CommentsViewParameters = {
        comments: Comment[]
    }

    type DirectoryViewParameters = {
        path: string
        entries: {
            name: string
            size: number
            date: Date
        }[]
    }

    type HomeViewParameters = {
        titles: BlogTypes.Title[]
        features: {
            music: Feature[]
            coding: Feature[]
            gaming: Feature[]
            life: Feature[]
        }
        recent: Track[]
        classics: Track[]
        commits: GithubTypes.Commit[]
        releases: GithubTypes.Release[]
        wow: ProfileTypes.WowData
        d3: ProfileTypes.D3Data[]
        ff14: ProfileTypes.FF14Data
        speedruns: Speedrun[]
        necrodancer: NecroDancer[]
        validated?: boolean
        emailChangeAuthorized?: boolean
        emailChanged?: boolean
        changePasswordSuccess?: boolean
        changeEmailSuccess?: boolean
    }

    type IndexViewParameters = {
        head: string
        pageHtml: string
        infoHtml: string
        host: string
        originalUrl: string
        year: number
        version: string
        user: User
        userLinks: {
            title: string
            href: string
        }[]
        contacts: Contact[]
        comments: Comment[]
    }

    type PageViewParameters = {
        page: Page
    }

    type PaginationPageViewParameters = {
        page: number
        total: number
    }

    type PlaylistViewParameters = {
        page?: Page
        playlist: Playlist
    }

    type UserViewParameters = {
        user: User
        userLinks: {
            title: string
            href: string
        }[]
    }
}

export = ViewTypes
