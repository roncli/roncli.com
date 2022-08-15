/**
 * @typedef {import("../../types/node/mastodonTypes".Post} MastodonTypes.Post
 * @typedef {import("../../types/node/microblogTypes").MicroblogData} MicroblogTypes.MicroblogData
 * @typedef {import("../../types/node/twitterTypes").Tweet} TwitterTypes.Tweet
 * @typedef {import("twitter-api-v2").MediaVariantsV2} TwitterApi.MediaVariantsV2
 */

const Cache = require("@roncli/node-redis").Cache,
    Discord = require("../discord"),
    Log = require("@roncli/node-application-insights-logger"),
    Mastodon = require("../mastodon"),
    MastodonModel = require("./mastodon"),
    Twitter = require("../twitter"),
    TwitterModel = require("./twitter"),

    serverMatch = /https?:\/\/(?<server>.+)\/@(?<username>.+)$/i;

//  #   #    #                         #       ##
//  #   #                              #        #
//  ## ##   ##     ###   # ##    ###   # ##     #     ###    ## #
//  # # #    #    #   #  ##  #  #   #  ##  #    #    #   #  #  #
//  #   #    #    #      #      #   #  #   #    #    #   #   ##
//  #   #    #    #   #  #      #   #  ##  #    #    #   #  #
//  #   #   ###    ###   #       ###   # ##    ###    ###    ###
//                                                          #   #
//                                                           ###
/**
 * A class that represents posts from a microblog.
 */
class Microblog {
    //                   #           #  #                #             #
    //                   #           ####                #             #
    //  ##    ###   ##   ###    ##   ####   ###   ###   ###    ##    ###   ##   ###
    // #     #  #  #     #  #  # ##  #  #  #  #  ##      #    #  #  #  #  #  #  #  #
    // #     # ##  #     #  #  ##    #  #  # ##    ##    #    #  #  #  #  #  #  #  #
    //  ##    # #   ##   #  #   ##   #  #   # #  ###      ##   ##    ###   ##   #  #
    /**
     * Caches the Mastodon posts.
     * @returns {Promise} A promise that resolves when the Mastodon posts have been cached.
     */
    static async cacheMastodon() {
        if (!+process.env.MASTODON_ENABLED) {
            return;
        }

        // Get the last post.
        const mastodon = await MastodonModel.get(),
            lastId = mastodon.lastId;

        // Check the timeline for new posts.
        const posts = await Mastodon.getNewPosts(lastId);

        if (posts.length > 0) {
            posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            const channel = Discord.findTextChannelByName("social-media");

            for (const post of posts) {
                // Skip all replies.
                if (post.post.in_reply_to_id) {
                    continue;
                }

                await Discord.richQueue(Discord.embedBuilder({
                    timestamp: new Date(post.post.created_at),
                    thumbnail: {
                        url: post.post.account.avatar,
                        width: 80,
                        height: 80
                    },
                    url: post.post.url,
                    title: `${post.post.account.display_name} - ${Microblog.getMastodonAccountName(post.post.account.url) ?? `@${post.post.account.username}`}`,
                    description: post.post.content,
                    footer: {
                        text: "Mastodon",
                        iconURL: "https://roncli.com/images/mastodon-logo.png"
                    }
                }), channel);
            }

            // Save the new last post.
            mastodon.lastId = posts[posts.length - 1].id;
            await mastodon.save();
        }

        if (posts.length > 0 || await Cache.ttl(`${process.env.REDIS_PREFIX}:mastodon:timeline`) < 86400) {
            await Microblog.cacheMastodonTimeline();
        }
    }

    //                   #           #  #                #             #              ###    #                ##     #
    //                   #           ####                #             #               #                       #
    //  ##    ###   ##   ###    ##   ####   ###   ###   ###    ##    ###   ##   ###    #    ##    # #    ##    #    ##    ###    ##
    // #     #  #  #     #  #  # ##  #  #  #  #  ##      #    #  #  #  #  #  #  #  #   #     #    ####  # ##   #     #    #  #  # ##
    // #     # ##  #     #  #  ##    #  #  # ##    ##    #    #  #  #  #  #  #  #  #   #     #    #  #  ##     #     #    #  #  ##
    //  ##    # #   ##   #  #   ##   #  #   # #  ###      ##   ##    ###   ##   #  #   #    ###   #  #   ##   ###   ###   #  #   ##
    /**
     * Caches the Mastodon timeline.
     * @returns {Promise} A promise that resolves when the Mastodon timeline has been cached.
     */
    static async cacheMastodonTimeline() {
        const timeline = await Mastodon.getTimeline(),
            expire = new Date();

        expire.setDate(expire.getDate() + 1);

        Cache.add(`${process.env.REDIS_PREFIX}:mastodon:timeline`, timeline, expire);
    }

    //                   #           #  #   #                      #     ##
    //                   #           ####                          #      #
    //  ##    ###   ##   ###    ##   ####  ##     ##   ###    ##   ###    #     ##    ###
    // #     #  #  #     #  #  # ##  #  #   #    #     #  #  #  #  #  #   #    #  #  #  #
    // #     # ##  #     #  #  ##    #  #   #    #     #     #  #  #  #   #    #  #   ##
    //  ##    # #   ##   #  #   ##   #  #  ###    ##   #      ##   ###   ###    ##   #
    //                                                                                ###
    /**
     * Caches the microblog posts.
     * @returns {Promise} A promise that resolves when the microbog posts have been cached.
     */
    static async cacheMicroblog() {
        await Promise.all([
            (async () => {
                try {
                    await Microblog.cacheTwitter();
                } catch (err) {
                    Log.error("There was a problem checking Twitter.", {err});
                }
            })(),
            (async () => {
                try {
                    await Microblog.cacheMastodon();
                } catch (err) {
                    Log.error("There was a problem checking Mastodon.", {err});
                }
            })()
        ]);
    }

    //                   #           ###          #     #     #
    //                   #            #                 #     #
    //  ##    ###   ##   ###    ##    #    #  #  ##    ###   ###    ##   ###
    // #     #  #  #     #  #  # ##   #    #  #   #     #     #    # ##  #  #
    // #     # ##  #     #  #  ##     #    ####   #     #     #    ##    #
    //  ##    # #   ##   #  #   ##    #    ####  ###     ##    ##   ##   #
    /**
     * Caches the Twitter posts.
     * @returns {Promise} A promise that resolves when the Twitter posts have been cached.
     */
    static async cacheTwitter() {
        if (!+process.env.TWITTER_ENABLED) {
            return;
        }

        // Get the client.
        await Twitter.getClient();

        // Get the last Tweet.
        const twitter = await TwitterModel.get(),
            lastId = twitter.lastId;

        // Check the timeline for new posts.
        const tweets = await Twitter.getNewPosts(lastId);

        if (tweets.length > 0) {
            tweets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            const channel = Discord.findTextChannelByName("social-media");

            for (const tweet of tweets) {
                // Skip all replies.
                if (tweet.tweet.in_reply_to_user_id) {
                    continue;
                }

                await Discord.richQueue(Discord.embedBuilder({
                    timestamp: new Date(tweet.tweet.created_at),
                    thumbnail: {
                        url: tweet.author.profile_image_url.replace("_normal", ""),
                        width: 80,
                        height: 80
                    },
                    url: `https://twitter.com/${tweet.author.username}/status/${tweet.tweet.id}`,
                    title: `${tweet.author.name} - @${tweet.author.username}`,
                    description: tweet.tweet.text,
                    footer: {
                        text: "Twitter",
                        iconURL: "https://roncli.com/images/twitter-logo.png"
                    }
                }), channel);
            }

            // Save the new last Tweet.
            twitter.lastId = tweets[tweets.length - 1].id;
            await twitter.save();
        }

        if (tweets.length > 0 || await Cache.ttl(`${process.env.REDIS_PREFIX}:twitter:timeline`) < 86400) {
            await Microblog.cacheTwitterTimeline();
        }
    }

    //                   #           ###          #     #     #                ###    #                ##     #
    //                   #            #                 #     #                 #                       #
    //  ##    ###   ##   ###    ##    #    #  #  ##    ###   ###    ##   ###    #    ##    # #    ##    #    ##    ###    ##
    // #     #  #  #     #  #  # ##   #    #  #   #     #     #    # ##  #  #   #     #    ####  # ##   #     #    #  #  # ##
    // #     # ##  #     #  #  ##     #    ####   #     #     #    ##    #      #     #    #  #  ##     #     #    #  #  ##
    //  ##    # #   ##   #  #   ##    #    ####  ###     ##    ##   ##   #      #    ###   #  #   ##   ###   ###   #  #   ##
    /**
     * Caches the Twitter timeline.
     * @returns {Promise} A promise that resolves when the Twitter timeline has been cached.
     */
    static async cacheTwitterTimeline() {
        const timeline = await Twitter.getTimeline(),
            expire = new Date();

        expire.setDate(expire.getDate() + 1);

        Cache.add(`${process.env.REDIS_PREFIX}:twitter:timeline`, timeline, expire);
    }

    //              #    #  #                #             #               ##                                  #    #  #
    //              #    ####                #             #              #  #                                 #    ## #
    //  ###   ##   ###   ####   ###   ###   ###    ##    ###   ##   ###   #  #   ##    ##    ##   #  #  ###   ###   ## #   ###  # #    ##
    // #  #  # ##   #    #  #  #  #  ##      #    #  #  #  #  #  #  #  #  ####  #     #     #  #  #  #  #  #   #    # ##  #  #  ####  # ##
    //  ##   ##     #    #  #  # ##    ##    #    #  #  #  #  #  #  #  #  #  #  #     #     #  #  #  #  #  #   #    # ##  # ##  #  #  ##
    // #      ##     ##  #  #   # #  ###      ##   ##    ###   ##   #  #  #  #   ##    ##    ##    ###  #  #    ##  #  #   # #  #  #   ##
    //  ###
    /**
     * Gets the Mastodon account name from the account's URL.
     * @param {string} url The account's URL.
     * @returns {string} The Mastodon account name.
     */
    static getMastodonAccountName(url) {
        if (!url) {
            return void 0;
        }

        const match = serverMatch.exec(url);

        return match ? `@${match.groups.username}@${match.groups.server}` : void 0;
    }

    //              #    #  #                #             #              ###    #                ##     #
    //              #    ####                #             #               #                       #
    //  ###   ##   ###   ####   ###   ###   ###    ##    ###   ##   ###    #    ##    # #    ##    #    ##    ###    ##
    // #  #  # ##   #    #  #  #  #  ##      #    #  #  #  #  #  #  #  #   #     #    ####  # ##   #     #    #  #  # ##
    //  ##   ##     #    #  #  # ##    ##    #    #  #  #  #  #  #  #  #   #     #    #  #  ##     #     #    #  #  ##
    // #      ##     ##  #  #   # #  ###      ##   ##    ###   ##   #  #   #    ###   #  #   ##   ###   ###   #  #   ##
    //  ###
    /**
     * Get the Mastodon timeline.
     * @returns {Promise<Microblog[]>} A promise that returns the Mastodon timeline.
     */
    static async getMastodonTimeline() {
        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:mastodon:timeline`])) {
            await Microblog.cacheMastodonTimeline();
        }

        /**
         * @type {MastodonTypes.Post[]}
         */
        const timeline = await Cache.get(`${process.env.REDIS_PREFIX}:mastodon:timeline`);

        return timeline.map((post) => new Microblog({
            url: post.post.url,
            name: post.post.account.display_name,
            username: Microblog.getMastodonAccountName(post.post.account.url),
            avatarUrl: post.post.account.avatar,
            profileUrl: post.post.account.url,
            inReplyToUsername: void 0,
            inReplyToUrl: void 0,
            post: post.post.content,
            createdAt: post.createdAt,
            displayDate: new Date(post.post.created_at),
            media: post.post.media_attachments.map((a) => ({type: a.type, url: a.url}))
        }));
    }

    //              #    #  #   #                      #     ##
    //              #    ####                          #      #
    //  ###   ##   ###   ####  ##     ##   ###    ##   ###    #     ##    ###
    // #  #  # ##   #    #  #   #    #     #  #  #  #  #  #   #    #  #  #  #
    //  ##   ##     #    #  #   #    #     #     #  #  #  #   #    #  #   ##
    // #      ##     ##  #  #  ###    ##   #      ##   ###   ###    ##   #
    //  ###                                                               ###
    /**
     * Retrieves the microblog.
     * @returns {Promise<Microblog[]>} A promise that returns the microblog.
     */
    static async getMicroblog() {
        const [mastodon, twitter] = await Promise.all([
            (() => Microblog.getMastodonTimeline())(),
            (() => Microblog.getTwitterTimeline())()
        ]);

        return [].concat(mastodon, twitter).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    //              #    ###          #     #     #                #  #           #   #          ###                 #    #  #               #                 #    #  #        ##
    //              #     #                 #     #                ####           #              #  #                #    #  #                                 #    #  #         #
    //  ###   ##   ###    #    #  #  ##    ###   ###    ##   ###   ####   ##    ###  ##     ###  ###    ##    ###   ###   #  #   ###  ###   ##     ###  ###   ###   #  #  ###    #
    // #  #  # ##   #     #    #  #   #     #     #    # ##  #  #  #  #  # ##  #  #   #    #  #  #  #  # ##  ##      #    #  #  #  #  #  #   #    #  #  #  #   #    #  #  #  #   #
    //  ##   ##     #     #    ####   #     #     #    ##    #     #  #  ##    #  #   #    # ##  #  #  ##      ##    #     ##   # ##  #      #    # ##  #  #   #    #  #  #      #
    // #      ##     ##   #    ####  ###     ##    ##   ##   #     #  #   ##    ###  ###    # #  ###    ##   ###      ##   ##    # #  #     ###    # #  #  #    ##   ##   #     ###
    //  ###
    /**
     * Gets the URL for the best variant for a media.
     * @param {TwitterApi.MediaVariantsV2[]} variants
     * @returns {string} The URL for the variant.
     */
    static getTwitterMediaBestVariantUrl(variants) {
        if (!variants) {
            return void 0;
        }

        const variantsWithVideo = variants.filter((v) => v.content_type === "video/mp4" && v.bit_rate !== void 0);

        if (variantsWithVideo.length === 0) {
            return void 0;
        }

        variantsWithVideo.sort((a, b) => b.bit_rate - a.bit_rate);

        return variantsWithVideo[0].url;
    }

    //              #    ###          #     #     #                ###    #                ##     #
    //              #     #                 #     #                 #                       #
    //  ###   ##   ###    #    #  #  ##    ###   ###    ##   ###    #    ##    # #    ##    #    ##    ###    ##
    // #  #  # ##   #     #    #  #   #     #     #    # ##  #  #   #     #    ####  # ##   #     #    #  #  # ##
    //  ##   ##     #     #    ####   #     #     #    ##    #      #     #    #  #  ##     #     #    #  #  ##
    // #      ##     ##   #    ####  ###     ##    ##   ##   #      #    ###   #  #   ##   ###   ###   #  #   ##
    //  ###
    /**
     * Get the Twitter timeline.
     * @returns {Promise<Microblog[]>} A promise that returns the Twitter timeline.
     */
    static async getTwitterTimeline() {
        if (!await Cache.exists([`${process.env.REDIS_PREFIX}:twitter:timeline`])) {
            await Microblog.cacheTwitterTimeline();
        }

        /**
         * @type {TwitterTypes.Tweet[]}
         */
        const timeline = await Cache.get(`${process.env.REDIS_PREFIX}:mastodon:timeline`);

        return timeline.map((post) => new Microblog({
            url: `https://twitter.com/_/status/${post.id}`,
            name: post.author.name,
            username: `@${post.author.username}`,
            avatarUrl: post.author.profile_image_url,
            profileUrl: post.author.url,
            inReplyToUsername: post.inReplyTo ? `@${post.inReplyTo.username}` : void 0,
            inReplyToUrl: post.tweet.referenced_tweets && post.tweet.referenced_tweets.length > 0 ? `https://twitter.com/_/status/${post.tweet.referenced_tweets[0].id}` : void 0,
            post: post.tweet.text,
            createdAt: post.createdAt,
            displayDate: new Date(post.tweet.created_at),
            media: post.medias.map((m) => ({type: m.type, url: m.url ?? Microblog.getTwitterMediaBestVariantUrl(m.variants)}))
        }));
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new microblog object.
     * @param {MicroblogTypes.MicroblogData} data The microblog data.
     */
    constructor(data) {
        this.url = data.url;
        this.name = data.name;
        this.username = data.username;
        this.avatarUrl = data.avatarUrl;
        this.profileUrl = data.profileUrl;
        this.inReplyToUsername = data.inReplyToUsername;
        this.inReplyToUrl = data.inReplyToUrl;
        this.post = data.post;
        this.createdAt = data.createdAt;
        this.displayDate = data.displayDate;
        this.media = data.media;
    }
}

module.exports = Microblog;
