/**
 * @name Tweet
 * @property {string} id_str
 * @property {string} created_at
 * @property {{user: {profile_image_url: string, screen_name: string}, text: string}} retweeted_status
 * @property {{profile_image_url: string, screen_name: string}} user
 * @property {string} text
 */

var config = require("../privateConfig").twitter,
    Twitter = require("twitter"),
    twitter = new Twitter(config),
    cache = require("../cache/cache");

module.exports.getTweets = function(callback) {
    "use strict";

    cache.get("roncli.com:tweets", function(cachedTweets) {
        if (cachedTweets) {
            callback(null, cachedTweets);
            return;
        }

        /**
         * @param {Tweet[]} data
         */
        twitter.get("statuses/user_timeline.json", {count: 200}, function(err, data) {
            var tweets;

            if (err) {
                console.log("Bad response from Twitter.");
                console.log(err);
                callback({
                    error: "Bad response from Twitter.",
                    status: 502
                });
            } else {
                /**
                 * @param {Tweet} tweet
                 * @returns {{id_str: string, timestamp: Date, avatarUrl: string, user: string, html: string}}
                 */
                tweets = data.map(function(tweet) {
                    return {
                        id: tweet.id_str,
                        timestamp: new Date(tweet.created_at),
                        avatarUrl: tweet.retweeted_status ? tweet.retweeted_status.user.profile_image_url : tweet.user.profile_image_url,
                        user: tweet.retweeted_status ? tweet.retweeted_status.user.screen_name : tweet.user.screen_name,
                        html: (tweet.retweeted_status ? tweet.retweeted_status.text : tweet.text)
                            .replace(/(.*?)((([hH][tT][tT][pP][sS]?|[fF][tT][pP]):\/\/)?([\w\.\-]+(:[\w\.&%\$\-]+)*@)?((([^\s\(\)<>\\"\.\[\],@;:]+)(\.[^\s\(\)<>\\"\.\[\],@;:]+)*(\.[a-zA-Z]{2,4}))|((([01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}([01]?\d{1,2}|2[0-4]\d|25[0-5])))(\b:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}|0)\b)?((\/[^\/][\w\.,\?'\\\/\+&%\$#=~_\-@]*)*[^\.,\?"'\(\)\[\]!;<>{}\s\x7F-\xFF])?)(.*?)/g, "$1<a target=\"_blank\" href=\"$2\">$2</a>$20")
                            .replace(/([<]a target="_blank" href=")((?!(https?:\/\/|ftp:\/\/))[^"]*)(")/g, "$1http://$2$4")
                            .replace(/^((?:[ ])*)(@([a-zA-Z0-9_]{1,20}))(.*?)/g, "$1<a target=\"_blank\" href=\"http://twitter.com/$3\">$2</a>$4")
                            .replace(/(.*?)(^|[^a-zA-Z0-9_>])(@([a-zA-Z0-9_]{1,20}))((?=(.|$)).*?)/g, "$1$2<a href=\"http://twitter.com/$4\">$3</a>$5")
                            .replace(/(.*?)(^|[^a-zA-Z0-9&\/]+)(#|\uFF03)([a-zA-Z0-9_]*[a-zA-Z_]+#*)(.*?)/g, "$1$2<a target=\"_blank\" href=\"http://twitter.com/search?q=%23$4\">$3$4</a>$5")
                    };
                });

                cache.set("roncli.com:tweets", tweets, 900);
                callback(null, tweets);
            }
        });
    });
};
