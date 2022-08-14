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
            posts.sort((a, b) => a.id.localeCompare(b.id));

            const channel = Discord.findTextChannelByName("social-media");

            for (const post of posts) {
                // Skip all replies.
                if (post.post.in_reply_to_id) {
                    continue;
                }

                const match = serverMatch.exec(post.post.account.url);

                await Discord.richQueue(Discord.embedBuilder({
                    timestamp: new Date(post.post.created_at),
                    thumbnail: {
                        url: post.post.account.avatar,
                        width: 80,
                        height: 80
                    },
                    url: post.post.url,
                    title: `${post.post.account.display_name} - ${match ? `@${match.groups.username}@${match.groups.server}` : `@${post.post.account.username}`}`,
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

        const key = `${process.env.REDIS_PREFIX}:mastodon:timeline`;
        if (posts.length > 0 || await Cache.ttl(key) < 86400) {
            // Get the timeline and save to cache.
            const timeline = await Mastodon.getTimeline(),
                expire = new Date();

            expire.setDate(expire.getDate() + 1);

            Cache.add(key, timeline, expire);
        }
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
            tweets.sort((a, b) => a.id.localeCompare(b.id));

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

        const key = `${process.env.REDIS_PREFIX}:twitter:timeline`;
        if (tweets.length > 0 || await Cache.ttl(key) < 86400) {
            // Get the timeline and save to cache.
            const timeline = await Twitter.getTimeline(),
                expire = new Date();

            expire.setDate(expire.getDate() + 1);

            Cache.add(key, timeline, expire);
        }
    }
}

module.exports = Microblog;
