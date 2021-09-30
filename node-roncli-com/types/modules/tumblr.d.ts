// TODO: Remove this file and declarations of this type when https://github.com/tumblr/tumblr.js/issues/101 is resolved.

import {AudioPostParams, ChatPostParams, LinkPostParams, QuotePostParams, PhotoPostParams, TextPostParams, TumblrClient, TumblrClientCallback, VideoPostParams} from "tumblr.js"

export class TumblrClient_Fixed implements TumblrClient {
    userInfo(callback: TumblrClientCallback): void

    blogAvatar(blogIdentifier: string, size: number, params: object, callback: TumblrClientCallback): void
    blogAvatar(blogIdentifier: string, size: number, callback: TumblrClientCallback): void
    blogAvatar(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
    blogAvatar(blogIdentifier: string, callback: TumblrClientCallback): void

    blogDrafts(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
    blogDrafts(blogIdentifier: string, callback: TumblrClientCallback): void

    blogFollowers(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
    blogFollowers(blogIdentifier: string, callback: TumblrClientCallback): void

    blogInfo(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
    blogInfo(blogIdentifier: string, callback: TumblrClientCallback): void

    blogLikes(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
    blogLikes(blogIdentifier: string, callback: TumblrClientCallback): void

    blogPosts(blogIdentifier: string): Promise<any>
    blogPosts(blogIdentifier: string, type: string): Promise<any>
    blogPosts(blogIdentifier: string, params: any): Promise<any>
    blogPosts(blogIdentifier: string, type: string, params: any): Promise<any>
    blogPosts(blogIdentifier: string, params: any, callback: TumblrClientCallback): void
    blogPosts(blogIdentifier: string, callback: TumblrClientCallback): void
    blogPosts(blogIdentifier: string, type: string, params: any, callback: TumblrClientCallback): void

    blogSubmissions(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
    blogSubmissions(blogIdentifier: string, callback: TumblrClientCallback): void

    blogQueue(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
    blogQueue(blogIdentifier: string, callback: TumblrClientCallback): void

    createTextPost(blogIdentifier: string, options: TextPostParams, callback: TumblrClientCallback): void
    createPhotoPost(blogIdentifier: string, options: PhotoPostParams, callback: TumblrClientCallback): void
    createQuotePost(blogIdentifier: string, options: QuotePostParams, callback: TumblrClientCallback): void
    createLinkPost(blogIdentifier: string, options: LinkPostParams, callback: TumblrClientCallback): void
    createChatPost(blogIdentifier: string, options: ChatPostParams, callback: TumblrClientCallback): void
    createAudioPost(blogIdentifier: string, options: AudioPostParams, callback: TumblrClientCallback): void
    createVideoPost(blogIdentifier: string, options: VideoPostParams, callback: TumblrClientCallback): void

    taggedPosts(tag: string, options: object, callback: TumblrClientCallback): void
    taggedPosts(tag: string, callback: TumblrClientCallback): void

    deletePost(blogIdentifier: string, params: object, callback: TumblrClientCallback): void
    deletePost(blogIdentifier: string, id: number | string, callback: TumblrClientCallback): void

    editPost(blogIdentifier: string, params: object, callback: TumblrClientCallback): void

    reblogPost(blogIdentifier: string, params: object, callback: TumblrClientCallback): void

    userDashboard(params: object, callback: TumblrClientCallback): void
    userDashboard(callback: TumblrClientCallback): void

    userLikes(params: object, callback: TumblrClientCallback): void
    userLikes(callback: TumblrClientCallback): void

    userFollowing(params: object, callback: TumblrClientCallback): void
    userFollowing(callback: TumblrClientCallback): void

    followBlog(params: object, callback: TumblrClientCallback): void
    followBlog(blogURL: string, callback: TumblrClientCallback): void

    unfollowBlog(params: object, callback: TumblrClientCallback): void
    unfollowBlog(blogURL: string, callback: TumblrClientCallback): void

    likePost(params: object, callback: TumblrClientCallback): void
    likePost(id: number | string, reblogKey: string, callback: TumblrClientCallback): void

    unlikePost(params: object, callback: TumblrClientCallback): void
    unlikePost(id: number | string, reblogKey: string, callback: TumblrClientCallback): void
}
