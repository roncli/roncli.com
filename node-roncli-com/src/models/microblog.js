/**
 * @typedef {import("../../types/node/mastodonTypes").Post} MastodonTypes.Post
 * @typedef {import("../../types/node/microblogTypes").MicroblogData} MicroblogTypes.MicroblogData
 */

const Cache = require("@roncli/node-redis").Cache,
    Discord = require("../discord"),
    HtmlToText = require("html-to-text"),
    Log = require("@roncli/node-application-insights-logger"),
    Mastodon = require("../mastodon"),
    MastodonModel = require("./mastodon"),

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

            if (+process.env.DISCORD_ENABLED) {
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
                        description: HtmlToText.convert(post.post.content, {selectors: [{selector: "a", format: "inline"}], wordwrap: false}),
                        footer: {
                            text: "Mastodon",
                            iconURL: "https://roncli.com/images/mastodon-logo.png"
                        }
                    }), channel);
                }
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

        await Cache.add(`${process.env.REDIS_PREFIX}:mastodon:timeline`, timeline, expire);
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
        try {
            await Microblog.cacheMastodon();
        } catch (err) {
            Log.error("There was a problem checking Mastodon.", {err});
        }
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
            id: post.id,
            source: "mastodon",
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
        try {
            const mastodon = await Microblog.getMastodonTimeline();

            return mastodon.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } catch (err) {
            Log.error("There was an error while getting the microblog.", {err});
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
     * Creates a new microblog object.
     * @param {MicroblogTypes.MicroblogData} data The microblog data.
     */
    constructor(data) {
        this.id = data.id;
        this.source = data.source;
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
