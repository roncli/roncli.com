/**
 * @typedef {import("../../types/node/blogTypes").Title} BlogTypes.Title
 * @typedef {import("googleapis").blogger_v3.Schema$Comment} Google.Blogger.SchemaComment
 * @typedef {import("googleapis").blogger_v3.Schema$Post} Google.Blogger.SchemaPost
 */

const Blogger = require("../google/blogger"),
    Cache = require("node-redis").Cache,
    HashCache = require("node-redis").HashCache,
    Log = require("node-application-insights-logger"),
    SortedSetCache = require("node-redis").SortedSetCache,
    Tumblr = require("../tumblr"),

    bloggerUrlMatch = /^https?:\/\/blog\.roncli\.com\/[0-9]{4}\/[0-9]{2}\/(?<path>.*)\.html$/;

//  ####    ##
//   #  #    #
//   #  #    #     ###    ## #
//   ###     #    #   #  #  #
//   #  #    #    #   #   ##
//   #  #    #    #   #  #
//  ####    ###    ###    ###
//                       #   #
//                        ###
/**
 * A class that represents a blog post.
 */
class Blog {
    //                   #           ###   ##
    //                   #           #  #   #
    //  ##    ###   ##   ###    ##   ###    #     ##    ###
    // #     #  #  #     #  #  # ##  #  #   #    #  #  #  #
    // #     # ##  #     #  #  ##    #  #   #    #  #   ##
    //  ##    # #   ##   #  #   ##   ###   ###    ##   #
    //                                                  ###
    /**
     * Caches the blog.
     * @returns {Promise} A promise that resolves when the blog is cached.
     */
    static async cacheBlog() {
        // Cache the two blogs.
        await Promise.all([Blog.cacheBlogger(), Blog.cacheTumblr()]);

        // Create the combination keys.
        const expire = new Date();
        expire.setDate(expire.getDate() + 7);

        await Promise.all([
            SortedSetCache.combine(`${process.env.REDIS_PREFIX}:blog:titles`, [`${process.env.REDIS_PREFIX}:blogger:titles`, `${process.env.REDIS_PREFIX}:tumblr:titles`], expire),
            SortedSetCache.combine(`${process.env.REDIS_PREFIX}:blog:categories`, [`${process.env.REDIS_PREFIX}:blogger:categories`, `${process.env.REDIS_PREFIX}:tumblr:categories`], expire)
        ]);

        // Create the combination category keys.
        /** @type {string[]} */
        const categories = await SortedSetCache.get(`${process.env.REDIS_PREFIX}:blog:categories`, 0, -1);
        await Promise.all(categories.map((category) => (async () => {
            await SortedSetCache.combine(`${process.env.REDIS_PREFIX}:blog:category:${category}`, [`${process.env.REDIS_PREFIX}:blogger:category:${category}`, `${process.env.REDIS_PREFIX}:tumblr:category:${category}`], expire);
        })()));
    }

    //                   #           ###   ##
    //                   #           #  #   #
    //  ##    ###   ##   ###    ##   ###    #     ##    ###   ###   ##   ###
    // #     #  #  #     #  #  # ##  #  #   #    #  #  #  #  #  #  # ##  #  #
    // #     # ##  #     #  #  ##    #  #   #    #  #   ##    ##   ##    #
    //  ##    # #   ##   #  #   ##   ###   ###    ##   #     #      ##   #
    //                                                  ###   ###
    /**
     * Caches the blog titles from Blogger.
     * @returns {Promise} A promise that resolves when the blog is cached.
     */
    static async cacheBlogger() {
        // Retrieve all the titles from the blog.
        const titles = (await Blogger.getTitles()).map((title) => {
            let path = "";
            if (bloggerUrlMatch.test(title.url)) {
                ({groups: {path}} = bloggerUrlMatch.exec(title.url));
            }

            return {
                score: new Date(title.published).getTime(),
                value: {
                    blogSource: "blogger",
                    id: title.id,
                    categories: title.labels,
                    published: new Date(title.published).getTime(),
                    title: title.title,
                    url: `/blogger/${title.id}/${path}`
                }
            };
        });

        // Divide the titles into categories.
        const categories = {};
        for (const title of titles) {
            if (title.value.categories) {
                for (const category of title.value.categories) {
                    if (!categories[category]) {
                        categories[category] = [];
                    }
                    categories[category].push(title);
                }
            }
        }

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 7);

        const promises = [
            (async () => {
                await SortedSetCache.add(`${process.env.REDIS_PREFIX}:blogger:titles`, titles, expire);
            })(),
            (async () => {
                await HashCache.add(`${process.env.REDIS_PREFIX}:blog:urls`, titles.map((title) => ({
                    key: title.value.url,
                    value: title.value
                })), expire);
            })(),
            (async () => {
                await SortedSetCache.add(`${process.env.REDIS_PREFIX}:blogger:categories`, Object.keys(categories).map((category) => ({
                    score: -categories[category].length,
                    value: category
                })), expire);
            })()
        ];

        for (const category in Object.keys(categories)) {
            if (Object.prototype.hasOwnProperty.call(categories, category)) {
                promises.push((async () => {
                    await SortedSetCache.add(`${process.env.REDIS_PREFIX}:blogger:category:${category}`, categories[category], expire);
                })());
            }
        }

        await Promise.all(promises);
    }

    //                   #           ###   ##                                  ###                 #
    //                   #           #  #   #                                  #  #                #
    //  ##    ###   ##   ###    ##   ###    #     ##    ###   ###   ##   ###   #  #   ##    ###   ###
    // #     #  #  #     #  #  # ##  #  #   #    #  #  #  #  #  #  # ##  #  #  ###   #  #  ##      #
    // #     # ##  #     #  #  ##    #  #   #    #  #   ##    ##   ##    #     #     #  #    ##    #
    //  ##    # #   ##   #  #   ##   ###   ###    ##   #     #      ##   #     #      ##   ###      ##
    //                                                  ###   ###
    /**
     * Caches a post from Blogger.
     * @param {string} id The ID of the post and returns it.
     * @returns {Promise<Google.Blogger.SchemaPost>} A promise that resolves when the post is cached.
     */
    static async cacheBloggerPost(id) {
        const post = await Blogger.getPost(id);

        await HashCache.add(`${process.env.REDIS_PREFIX}:blogger:posts`, [{key: post.id, value: post}]);

        return post;
    }

    //                   #           ###               #     ##
    //                   #            #                #      #
    //  ##    ###   ##   ###    ##    #    #  #  # #   ###    #    ###
    // #     #  #  #     #  #  # ##   #    #  #  ####  #  #   #    #  #
    // #     # ##  #     #  #  ##     #    #  #  #  #  #  #   #    #
    //  ##    # #   ##   #  #   ##    #     ###  #  #  ###   ###   #
    /**
     * Caches the blog from Tumblr.  Includes posts since you can't get just the titles.
     * @returns {Promise} A promise that resolves when the blog is cached.
     */
    static async cacheTumblr() {
        // Retrieve all the posts from Tumblr.
        const posts = await Tumblr.getPosts(),
            titles = posts.map((post) => ({
                score: post.timestamp * 1000,
                value: {
                    blogSource: "tumblr",
                    id: post.id,
                    categories: post.tags,
                    published: post.timestamp * 1000,
                    title: Tumblr.getTitleFromPost(post),
                    url: `/tumblr/${post.id}/${post.slug}`
                }
            }));

        // Divide the posts into categories.
        const categories = {};
        for (const title of titles) {
            if (title.value.categories) {
                for (const category of title.value.categories) {
                    if (!categories[category]) {
                        categories[category] = [];
                    }
                    categories[category].push(title);
                }
            }
        }

        // Save to cache.
        const expire = new Date();
        expire.setDate(expire.getDate() + 7);

        const promises = [
            (async () => {
                await SortedSetCache.add(`${process.env.REDIS_PREFIX}:tumblr:titles`, titles, expire);
            })(),
            (async () => {
                await HashCache.add(`${process.env.REDIS_PREFIX}:blog:urls`, titles.map((title) => ({
                    key: title.value.url,
                    value: title.value
                })), expire);
            })(),
            (async () => {
                await SortedSetCache.add(`${process.env.REDIS_PREFIX}:tumblr:categories`, Object.keys(categories).map((category) => ({
                    score: -categories[category].length,
                    value: category
                })), expire);
            })(),
            (async () => {
                await HashCache.add(`${process.env.REDIS_PREFIX}:tumblr:posts`, posts.map((post) => ({
                    key: post.id,
                    value: post
                })), expire);
            })()
        ];

        for (const category in Object.keys(categories)) {
            if (Object.prototype.hasOwnProperty.call(categories, category)) {
                promises.push((async () => {
                    await SortedSetCache.add(`${process.env.REDIS_PREFIX}:tumblr:category:${category}`, categories[category], expire);
                })());
            }
        }

        await Promise.all(promises);
    }

    //              #    ###                 #    ###         #  #        ##
    //              #    #  #                #    #  #        #  #         #
    //  ###   ##   ###   #  #   ##    ###   ###   ###   #  #  #  #  ###    #
    // #  #  # ##   #    ###   #  #  ##      #    #  #  #  #  #  #  #  #   #
    //  ##   ##     #    #     #  #    ##    #    #  #   # #  #  #  #      #
    // #      ##     ##  #      ##   ###      ##  ###     #    ##   #     ###
    //  ###                                              #
    /**
     * Gets a post by its URL.
     * @param {string} url The URL of the post to retrieve.
     * @returns {Promise<Blog>} A promise that returns with the blog post.
     */
    static async getPostByUrl(url) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:blog:urls`])) {
                await Blog.cacheBlog();
            }

            /** @type {BlogTypes.Title} */
            const title = await HashCache.get(`${process.env.REDIS_PREFIX}:blog:urls`, url);

            /** @type {Google.Blogger.SchemaComment[]} */
            let comments = void 0;

            let content;
            switch (title.blogSource) {
                case "blogger":
                    content = await HashCache.get(`${process.env.REDIS_PREFIX}:blogger:posts`, title.id);
                    if (!content) {
                        content = await Blog.cacheBloggerPost(title.id);
                    }

                    comments = await Blogger.getComments(title.id);
                    break;
                case "tumblr":
                    content = await HashCache.get(`${process.env.REDIS_PREFIX}:tumblr:posts`, title.id);
                    break;
            }

            return new Blog(title, content, comments);
        } catch (err) {
            Log.error("There was an error while getting a blog post by URL.", {err});
            return void 0;
        }
    }

    //              #    ###    #     #    ##
    //              #     #           #     #
    //  ###   ##   ###    #    ##    ###    #     ##    ###
    // #  #  # ##   #     #     #     #     #    # ##  ##
    //  ##   ##     #     #     #     #     #    ##      ##
    // #      ##     ##   #    ###     ##  ###    ##   ###
    //  ###
    /**
     * Gets a list of blog titles.
     * @param {number} offset The title to start from.
     * @param {number} count The number of titles to retrieve.
     * @returns {Promise<BlogTypes.Title[]>} A promise that returns the titles.
     */
    static async getTitles(offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:blog:titles`])) {
                await Blog.cacheBlog();
            }

            return (await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:blog:titles`, offset, offset + count - 1)).map((t) => {
                t.published = new Date(t.published);
                return t;
            });
        } catch (err) {
            Log.error("There was an error while getting blog titles.", {err});
            return [];
        }
    }

    //              #    ###    #     #    ##                 ###          ##          #
    //              #     #           #     #                 #  #        #  #         #
    //  ###   ##   ###    #    ##    ###    #     ##    ###   ###   #  #  #      ###  ###    ##    ###   ##   ###   #  #
    // #  #  # ##   #     #     #     #     #    # ##  ##     #  #  #  #  #     #  #   #    # ##  #  #  #  #  #  #  #  #
    //  ##   ##     #     #     #     #     #    ##      ##   #  #   # #  #  #  # ##   #    ##     ##   #  #  #      # #
    // #      ##     ##   #    ###     ##  ###    ##   ###    ###     #    ##    # #    ##   ##   #      ##   #       #
    //  ###                                                          #                             ###               #
    /**
     * Gets a list of blog titles by category.
     * @param {string} category The category to get the titles for.
     * @param {number} offset The title to start from.
     * @param {number} count The number of titles to retrieve.
     * @returns {Promise<BlogTypes.Title[]>} A promise that returns the titles.
     */
    static async getTitlesByCategory(category, offset, count) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:blog:category:${category}`])) {
                await Blog.cacheBlog();
            }

            return (await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:blog:category:${category}`, offset, offset + count - 1)).map((t) => {
                t.published = new Date(t.published);
                return t;
            });
        } catch (err) {
            Log.error("There was an error while getting blog titles by category.", {err, properties: {category}});
            return [];
        }
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new blog object.
     * @param {BlogTypes.Title} post The title of the post.
     * @param {object} content The content of the post.
     * @param {Google.Blogger.SchemaComment[]} [comments] The comments.
     */
    constructor(post, content, comments) {
        this.post = post;
        this.content = content;
        this.comments = comments;
    }
}

module.exports = Blog;
