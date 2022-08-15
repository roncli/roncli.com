/**
 * @typedef {import("../../types/node/twitterTypes").Tweet} TwitterTypes.Tweet
 */

const TwitterApi = require("twitter-api-v2");

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
    //              #     ##   ##     #                 #
    //              #    #  #   #                       #
    //  ###   ##   ###   #      #    ##     ##   ###   ###
    // #  #  # ##   #    #      #     #    # ##  #  #   #
    //  ##   ##     #    #  #   #     #    ##    #  #   #
    // #      ##     ##   ##   ###   ###    ##   #  #    ##
    //  ###
    /**
     * Gets a logged in read-only Twitter client.
     * @returns {Promise} A promise that resovles when the client has been retrieved.
     */
    static async getClient() {
        const api = new TwitterApi.TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET
        });

        client = (await api.appLogin()).readOnly;
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
     * @returns {Promise<TwitterTypes.Tweet[]>} A list of Twitter posts.
     */
    static async getNewPosts(lastId) {
        /** @type {TwitterTypes.Tweet[]} */
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
                    author: timeline.includes.userById(retweet.author_id),
                    createdAt: new Date(tweet.created_at)
                });
            } else {
                tweets.push({
                    id: tweet.id,
                    tweet,
                    author: timeline.includes.userById(tweet.author_id),
                    createdAt: new Date(tweet.created_at)
                });
            }
        }

        return tweets;
    }

    //              #    ###    #                ##     #
    //              #     #                       #
    //  ###   ##   ###    #    ##    # #    ##    #    ##    ###    ##
    // #  #  # ##   #     #     #    ####  # ##   #     #    #  #  # ##
    //  ##   ##     #     #     #    #  #  ##     #     #    #  #  ##
    // #      ##     ##   #    ###   #  #   ##   ###   ###   #  #   ##
    //  ###
    /**
     * Gets the Twitter timeline.
     * @returns {Promise<TwitterTypes.Tweet[]>} A list of Twitter posts.
     */
    static async getTimeline() {
        /** @type {TwitterTypes.Tweet[]} */
        const tweets = [];

        const timeline = await client.v2.userTimeline(process.env.TWITTER_ID, {
            "max_results": 50,
            exclude: "replies",
            expansions: ["author_id", "attachments.media_keys", "referenced_tweets.id.author_id"],
            "tweet.fields": ["in_reply_to_user_id", "attachments", "created_at", "referenced_tweets"],
            "user.fields": ["name", "profile_image_url"],
            "media.fields": ["type", "url", "variants"]
        });

        for (const tweet of timeline.tweets) {
            if (tweet.referenced_tweets && tweet.referenced_tweets[0].type === "retweeted") {
                const retweet = timeline.includes.tweetById(tweet.referenced_tweets[0].id);

                tweets.push({
                    id: tweet.id,
                    tweet: retweet,
                    author: timeline.includes.userById(retweet.author_id),
                    createdAt: new Date(tweet.created_at),
                    medias: timeline.includes.medias(retweet),
                    inReplyTo: tweet.in_reply_to_user_id && timeline.includes.userById(tweet.in_reply_to_user_id) || void 0
                });
            } else {
                tweets.push({
                    id: tweet.id,
                    tweet,
                    author: timeline.includes.userById(tweet.author_id),
                    createdAt: new Date(tweet.created_at),
                    medias: timeline.includes.medias(tweet),
                    inReplyTo: tweet.in_reply_to_user_id && timeline.includes.userById(tweet.in_reply_to_user_id) || void 0
                });
            }
        }

        return tweets;
    }
}

module.exports = Twitter;
