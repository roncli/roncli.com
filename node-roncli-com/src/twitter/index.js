/**
 * @typedef {{id: string, tweet: TwitterApi.TweetV2, author: TwitterApi.UserV2}} Tweet
 */

const Discord = require("../discord"),
    Log = require("@roncli/node-application-insights-logger"),
    TwitterModel = require("../models/twitter"),
    TwitterApi = require("twitter-api-v2");

/** @type {TwitterApi.TwitterApiReadOnly} */
let client = void 0;

//  #####           #     #      #
//    #                   #      #
//    #    #   #   ##    ####   ####    ###   # ##
//    #    #   #    #     #      #     #   #  ##  #
//    #    # # #    #     #      #     #####  #
//    #    # # #    #     #  #   #  #  #      #
//    #     # #    ###     ##     ##    ###   #
/**
 * A class that handles calls to the Twitter API.
 */
class Twitter {
    //       #                 #     ###                 #
    //       #                 #     #  #                #
    //  ##   ###    ##    ##   # #   #  #   ##    ###   ###    ###
    // #     #  #  # ##  #     ##    ###   #  #  ##      #    ##
    // #     #  #  ##    #     # #   #     #  #    ##    #      ##
    //  ##   #  #   ##    ##   #  #  #      ##   ###      ##  ###
    /**
     * Checks for recent posts.
     * @returns {Promise} A promise that resolves when the posts have been checked.
     */
    static async checkPosts() {
        if (!+process.env.TWITTER_ENABLED) {
            return;
        }

        try {
            // Get the client.
            client = await Twitter.getClient();

            // Get the last Tweet.
            const twitter = await TwitterModel.get(),
                lastId = twitter.lastId;

            // Check the timeline for new posts.
            const tweets = await Twitter.getNewPosts(lastId);

            if (tweets.length > 0) {
                tweets.sort((a, b) => a.tweet.id.localeCompare(b.tweet.id));

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
                            width: 32,
                            height: 32
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
        } catch (err) {
            Log.error("There was a problem checking Twitter.", {err});
        }

        setTimeout(Twitter.checkPosts, 300000);
    }

    //              #     ##   ##     #                 #
    //              #    #  #   #                       #
    //  ###   ##   ###   #      #    ##     ##   ###   ###
    // #  #  # ##   #    #      #     #    # ##  #  #   #
    //  ##   ##     #    #  #   #     #    ##    #  #   #
    // #      ##     ##   ##   ###   ###    ##   #  #    ##
    //  ###
    /**
     * Gets a logged in read-only Twitter client.
     * @returns {Promise<TwitterApi.TwitterApiReadOnly>} A read-only Twitter client.
     */
    static async getClient() {
        const api = new TwitterApi.TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET
        });

        return (await api.appLogin()).readOnly;
    }

    //              #    #  #              ###                 #
    //              #    ## #              #  #                #
    //  ###   ##   ###   ## #   ##   #  #  #  #   ##    ###   ###    ###
    // #  #  # ##   #    # ##  # ##  #  #  ###   #  #  ##      #    ##
    //  ##   ##     #    # ##  ##    ####  #     #  #    ##    #      ##
    // #      ##     ##  #  #   ##   ####  #      ##   ###      ##  ###
    //  ###
    /**
     * Gets the newest Twitter posts based on the last received ID.
     * @param {string} lastId The last tweet ID.
     * @returns {Promise<Tweet[]>} A list of Twitter posts.
     */
    static async getNewPosts(lastId) {
        /** @type {Tweet[]} */
        const tweets = [];

        const timeline = await client.v2.userTimeline(process.env.TWITTER_ID, {
            "since_id": lastId,
            "max_results": 100,
            exclude: "replies",
            expansions: ["author_id", "referenced_tweets.id.author_id"],
            "tweet.fields": ["in_reply_to_user_id", "created_at", "referenced_tweets"],
            "user.fields": ["name", "profile_image_url"]
        });

        for await (const tweet of timeline) {
            if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "retweeted") {
                const retweet = timeline.includes.tweetById(tweet.referenced_tweets[0].id);

                tweets.push({
                    id: tweet.id,
                    tweet: retweet,
                    author: timeline.includes.userById(retweet.author_id)
                });
            } else {
                tweets.push({
                    id: tweet.id,
                    tweet,
                    author: timeline.includes.userById(tweet.author_id)
                });
            }
        }

        return tweets;
    }
}

module.exports = Twitter;
