/**
 * @typedef {import("../../types/node/blogTypes").Title} BlogTypes.Title
 * @typedef {import("@googleapis/blogger").blogger_v3.Schema$Comment} Google.Blogger.SchemaComment
 * @typedef {import("@googleapis/blogger").blogger_v3.Schema$Post} Google.Blogger.SchemaPost
 */

const Blogger = require("../google/blogger"),
    Cache = require("@roncli/node-redis").Cache,
    HashCache = require("@roncli/node-redis").HashCache,
    Log = require("@roncli/node-application-insights-logger"),
    SortedSetCache = require("@roncli/node-redis").SortedSetCache,
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
        await Promise.all(categories.map((category) => SortedSetCache.combine(`${process.env.REDIS_PREFIX}:blog:category:${category}`, [`${process.env.REDIS_PREFIX}:blogger:category:${category}`, `${process.env.REDIS_PREFIX}:tumblr:category:${category}`], expire)));
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
                    categories: title.labels.sort(),
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
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:blogger:titles`, titles, expire),
            HashCache.add(`${process.env.REDIS_PREFIX}:blog:urls`, titles.map((title) => ({
                key: title.value.url,
                value: title.value
            })), expire),
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:blogger:categories`, Object.keys(categories).map((category) => ({
                score: categories[category].length,
                value: category
            })), expire)
        ];

        for (const category of Object.keys(categories)) {
            if (Object.prototype.hasOwnProperty.call(categories, category)) {
                promises.push(SortedSetCache.add(`${process.env.REDIS_PREFIX}:blogger:category:${category}`, categories[category], expire));
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
                    categories: post.tags.sort(),
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
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:tumblr:titles`, titles, expire),
            HashCache.add(`${process.env.REDIS_PREFIX}:blog:urls`, titles.map((title) => ({
                key: title.value.url,
                value: title.value
            })), expire),
            SortedSetCache.add(`${process.env.REDIS_PREFIX}:tumblr:categories`, Object.keys(categories).map((category) => ({
                score: categories[category].length,
                value: category
            })), expire),
            HashCache.add(`${process.env.REDIS_PREFIX}:tumblr:posts`, posts.map((post) => ({
                key: post.id,
                value: post
            })), expire)
        ];

        for (const category of Object.keys(categories)) {
            if (Object.prototype.hasOwnProperty.call(categories, category)) {
                promises.push(SortedSetCache.add(`${process.env.REDIS_PREFIX}:tumblr:category:${category}`, categories[category], expire));
            }
        }

        await Promise.all(promises);
    }

    //       ##                       ##               #
    //        #                      #  #              #
    //  ##    #     ##    ###  ###   #      ###   ##   ###    ##
    // #      #    # ##  #  #  #  #  #     #  #  #     #  #  # ##
    // #      #    ##    # ##  #     #  #  # ##  #     #  #  ##
    //  ##   ###    ##    # #  #      ##    # #   ##   #  #   ##
    /**
     * Clears the blog cache.
     * @returns {Promise} A promise that resolves when the cache has been cleared.
     */
    static async clearCache() {
        const blogKeys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:blog:*`);
        if (blogKeys.length > 0) {
            await Cache.remove(blogKeys);
        }

        const bloggerKeys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:blogger:*`);
        if (bloggerKeys.length > 0) {
            await Cache.remove(bloggerKeys);
        }

        const tumblrKeys = await Cache.getAllKeys(`${process.env.REDIS_PREFIX}:tumblr:*`);
        if (tumblrKeys.length > 0) {
            await Cache.remove(tumblrKeys);
        }
    }

    //                          #    ###    #     #    ##
    //                          #     #           #     #
    //  ##    ##   #  #  ###   ###    #    ##    ###    #     ##    ###
    // #     #  #  #  #  #  #   #     #     #     #     #    # ##  ##
    // #     #  #  #  #  #  #   #     #     #     #     #    ##      ##
    //  ##    ##    ###  #  #    ##   #    ###     ##  ###    ##   ###
    /**
     * Gets a count of the blog titles.
     * @returns {Promise<number>} A promise that returns the number of blog titles.
     */
    static async countTitles() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:blog:titles`])) {
                await Blog.cacheBlog();
            }

            return await SortedSetCache.count(`${process.env.REDIS_PREFIX}:blog:titles`, "-inf", "+inf");
        } catch (err) {
            Log.error("There was an error while counting blog titles.", {err});
            return 0;
        }
    }

    //                          #    ###    #     #    ##                 ###          ##          #
    //                          #     #           #     #                 #  #        #  #         #
    //  ##    ##   #  #  ###   ###    #    ##    ###    #     ##    ###   ###   #  #  #      ###  ###    ##    ###   ##   ###   #  #
    // #     #  #  #  #  #  #   #     #     #     #     #    # ##  ##     #  #  #  #  #     #  #   #    # ##  #  #  #  #  #  #  #  #
    // #     #  #  #  #  #  #   #     #     #     #     #    ##      ##   #  #   # #  #  #  # ##   #    ##     ##   #  #  #      # #
    //  ##    ##    ###  #  #    ##   #    ###     ##  ###    ##   ###    ###     #    ##    # #    ##   ##   #      ##   #       #
    //                                                                           #                             ###               #
    /**
     * Gets a count of the blog titles by category.
     * @param {string} category The category to get titles for.
     * @returns {Promise<number>} A promise that returns the number of blog titles.
     */
    static async countTitlesByCategory(category) {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:blog:category:${category}`])) {
                await Blog.cacheBlog();
            }

            return await SortedSetCache.count(`${process.env.REDIS_PREFIX}:blog:category:${category}`, "-inf", "+inf");
        } catch (err) {
            Log.error("There was an error while counting blog titles.", {err});
            return 0;
        }
    }

    //              #     ##          #                             #
    //              #    #  #         #
    //  ###   ##   ###   #      ###  ###    ##    ###   ##   ###   ##     ##    ###
    // #  #  # ##   #    #     #  #   #    # ##  #  #  #  #  #  #   #    # ##  ##
    //  ##   ##     #    #  #  # ##   #    ##     ##   #  #  #      #    ##      ##
    // #      ##     ##   ##    # #    ##   ##   #      ##   #     ###    ##   ###
    //  ###                                       ###
    /**
     * Gets the blog categories.
     * @returns {Promise<{category: string, posts: number}[]>} A promise that returns the categories.
     */
    static async getCategories() {
        try {
            if (!await Cache.exists([`${process.env.REDIS_PREFIX}:blog:categories`])) {
                await Blog.cacheBlog();
            }

            const categories = await SortedSetCache.getReverse(`${process.env.REDIS_PREFIX}:blog:categories`, 0, -1, true);

            return categories.map((c) => ({category: c.value, posts: c.score}));
        } catch (err) {
            Log.error("There was an error while getting blog categories.", {err});
            return void 0;
        }
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

            if (!title) {
                return void 0;
            }

            const [content, comments, mainNav, categoryNavs] = await Promise.all([
                (async () => {
                    switch (title.blogSource) {
                        case "blogger": {
                            const post = await HashCache.get(`${process.env.REDIS_PREFIX}:blogger:posts`, title.id);
                            if (!post) {
                                return Blog.cacheBloggerPost(title.id);
                            }
                            return post;
                        }
                        case "tumblr":
                            return HashCache.get(`${process.env.REDIS_PREFIX}:tumblr:posts`, title.id);
                        default:
                            return void 0;
                    }
                })(),
                (() => {
                    switch (title.blogSource) {
                        case "blogger":
                            return Blogger.getComments(title.id);
                        default:
                            return void 0;
                    }
                })(),
                (async () => {
                    const rank = await SortedSetCache.rankReverse(`${process.env.REDIS_PREFIX}:blog:titles`, title);

                    const [prev, next] = await Promise.all([
                        (async () => {
                            const prevTitle = await Blog.getTitles(rank + 1, 1);

                            if (!prevTitle) {
                                return void 0;
                            }

                            return prevTitle[0];
                        })(),
                        (async () => {
                            if (rank === 0) {
                                return void 0;
                            }

                            return (await Blog.getTitles(rank - 1, 1))[0];
                        })()
                    ]);

                    return {prev, next};
                })(),
                (async () => {
                    /** @type {{[x: string]: {prev: BlogTypes.Title, next: BlogTypes.Title}}} */
                    const categories = {};

                    await Promise.all(title.categories.map((category) => (async () => {
                        const rank = await SortedSetCache.rankReverse(`${process.env.REDIS_PREFIX}:blog:category:${category}`, title);

                        const [prev, next] = await Promise.all([
                            (async () => {
                                const prevTitle = await Blog.getTitlesByCategory(category, rank + 1, 1);

                                if (!prevTitle) {
                                    return void 0;
                                }

                                return prevTitle[0];
                            })(),
                            (async () => {
                                if (rank === 0) {
                                    return void 0;
                                }

                                return (await Blog.getTitlesByCategory(category, rank - 1, 1))[0];
                            })()
                        ]);

                        if (prev || next) {
                            categories[category] = {prev, next};
                        }
                    })()));

                    return categories;
                })()
            ]);

            return new Blog(title, content, comments, mainNav, categoryNavs);
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

    //              #    ###    #     #    ##                 ###          ##          #                                  ###         ###          #
    //              #     #           #     #                 #  #        #  #         #                                  #  #        #  #         #
    //  ###   ##   ###    #    ##    ###    #     ##    ###   ###   #  #  #      ###  ###    ##    ###   ##   ###   #  #  ###   #  #  #  #   ###  ###    ##
    // #  #  # ##   #     #     #     #     #    # ##  ##     #  #  #  #  #     #  #   #    # ##  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #  #   #    # ##
    //  ##   ##     #     #     #     #     #    ##      ##   #  #   # #  #  #  # ##   #    ##     ##   #  #  #      # #  #  #   # #  #  #  # ##   #    ##
    // #      ##     ##   #    ###     ##  ###    ##   ###    ###     #    ##    # #    ##   ##   #      ##   #       #   ###     #   ###    # #    ##   ##
    //  ###                                                          #                             ###               #           #
    /**
     * Gets the titles by category and date.
     * @param {string} category The category to get titles by.
     * @param {Date} date The date to get titles by.
     * @returns {Promise<{page: number, titles: BlogTypes.Title[]}>} A promise that returns the list of titles.
     */
    static async getTitlesByCategoryByDate(category, date) {
        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:blog:category:${category}`])) {
            await Blog.cacheBlog();
        }

        const count = await SortedSetCache.count(`${process.env.REDIS_PREFIX}:blog:category:${category}`, `(${date.getTime()}`, "+inf"),
            page = Math.max(Math.ceil(count / Blog.pageSize), 1);

        return {
            page,
            titles: await Blog.getTitlesByCategory(category, page * Blog.pageSize - Blog.pageSize, Blog.pageSize)
        };
    }

    //              #    ###    #     #    ##                 ###         ###          #
    //              #     #           #     #                 #  #        #  #         #
    //  ###   ##   ###    #    ##    ###    #     ##    ###   ###   #  #  #  #   ###  ###    ##
    // #  #  # ##   #     #     #     #     #    # ##  ##     #  #  #  #  #  #  #  #   #    # ##
    //  ##   ##     #     #     #     #     #    ##      ##   #  #   # #  #  #  # ##   #    ##
    // #      ##     ##   #    ###     ##  ###    ##   ###    ###     #   ###    # #    ##   ##
    //  ###                                                          #
    /**
     * Gets the titles by date.
     * @param {Date} date The date to get titles by.
     * @returns {Promise<{page: number, titles: BlogTypes.Title[]}>} A promise that returns the list of titles.
     */
    static async getTitlesByDate(date) {
        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:blog:titles`])) {
            await Blog.cacheBlog();
        }

        const count = await SortedSetCache.count(`${process.env.REDIS_PREFIX}:blog:titles`, `(${date.getTime()}`, "+inf"),
            page = Math.max(Math.ceil(count / Blog.pageSize), 1);

        return {
            page,
            titles: await Blog.getTitles(page * Blog.pageSize - Blog.pageSize, Blog.pageSize)
        };
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
     * @param {Google.Blogger.SchemaComment[]} comments The comments.
     * @param {{prev: BlogTypes.Title, next: BlogTypes.Title}} mainNav The main navigation.
     * @param {{[x: string]: {prev: BlogTypes.Title, next: BlogTypes.Title}}} categoryNavs The navigations for each category.
     */
    constructor(post, content, comments, mainNav, categoryNavs) {
        this.post = post;
        this.content = content;
        this.comments = comments;
        this.mainNav = mainNav;
        this.categoryNavs = categoryNavs;
    }
}

Blog.pageSize = 10;

module.exports = Blog;
