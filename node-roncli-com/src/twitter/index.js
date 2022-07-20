const Discord = require("../discord"),
    TwitterModel = require("../models/twitter"),
    TwitterApi = require("twitter-api-v2").TwitterApi;

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
        if (!process.env.TWITTER_ENABLED) {
            return;
        }

        // Get the last Tweet.
        const twitter = await TwitterModel.get(),
            lastId = twitter.lastId;

        const client = new TwitterApi({
            appKey: process.env.TWITTER_API_KEY,
            appSecret: process.env.TWITTER_API_SECRET,
            accessToken: process.env.TWITTER_ACCESS_TOKEN,
            accessSecret: process.env.TWITTER_ACCESS_SECRET
        });

        const appClient = (await client.appLogin()).readOnly,
            tweets = [];

        const timeline = await appClient.v2.userTimeline(process.env.TWITTER_ID, {
            "since_id": lastId,
            "max_results": 100,
            exclude: "replies",
            expansions: ["author_id"],
            "tweet.fields": ["in_reply_to_user_id"],
            "user.fields": ["name", "profile_image_url"]
        });

        for await (const tweet of timeline) {
            tweets.push({
                tweet,
                author: timeline.includes.userById(tweet.author_id)
            });
        }

        tweets.sort((a, b) => a.tweet.id.localeCompare(b.tweet.id));

        if (tweets.length === 0) {
            return;
        }

        const channel = Discord.findTextChannelByName("social-media");

        for (const tweet of tweets) {
            // Skip all replies.
            if (tweet.tweet.in_reply_to_user_id) {
                continue;
            }

            await Discord.richQueue(Discord.messageEmbed({
                timestamp: new Date(),
                thumbnail: {
                    url: tweet.author.profile_image_url.replace("_normal", ""),
                    width: 32,
                    height: 32
                },
                url: `https://twitter.com/${tweet.author.username}/status/${tweet.tweet.id}`,
                title: `${tweet.author.name} (${tweet.author.username})`,
                description: tweet.tweet.text,
                footer: {
                    text: "Twitter",
                    iconURL: "https://roncli.com/images/twitter-logo.png"
                }
            }), channel);
        }

        // Save the new last Tweet.
        twitter.lastId = tweets[tweets.length - 1].tweet.id;
        twitter.save();

        setTimeout(Twitter.checkPosts, 300000);
    }
}

module.exports = Twitter;
