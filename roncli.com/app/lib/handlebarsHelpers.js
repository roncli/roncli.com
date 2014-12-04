var moment = require("moment");

/**
 * Helpers for handlebars rendering.
 * @param {object} Handlebars The Handlebars object.
 * @returns {object} The helper functions to use with Handlebars.
 */
module.exports = function(Handlebars) {
    "use strict";

    return {
        /**
         * Returns meta tags.
         * @param {string} key The key of the meta tag.
         * @param {string|array} values If an array, returns one meta tag whose value is each element of the array.  Otherwise, the value of the sole meta tag.
         * @returns {string} The meta tags.
         */
        metaTags: function(key, values) {
            var tags;

            if (typeof values === "object") {
                tags = [];
                values.forEach(function(value) {
                    tags.push("<meta name=\"" + key + "\" content=\"" + value + "\"/>");
                });
                return tags.join("");
            }

            return "<meta name=\"" + key + "\" content=\"" + values + "\"/>";
        },

        /**
         * Returns the JSON object stringified.
         * @param {object} object The JSON object.
         * @param {string|number} spacing The spacing to use to stringify the JSON.
         * @returns {base.HandlebarsEnvironment.SafeString} The stringified JSON object.
         */
        jsonEscaped: function(object, spacing) {
            return new Handlebars.SafeString(JSON.stringify(object, null, spacing).replace("/script", "\\/script") || 'null');
        },

        /**
         * Determines whether to render the enclosed block.
         * @param {object} a The first object to compare.
         * @param {string} operator The operator to use.
         * @param {object} b The second object to compare.
         * @param {object} options The Handlebars helpers object.
         * @returns {function} The Handlebars rendering function.
         */
        ifCond: function(a, operator, b, options) {
            switch (operator) {
                case "===":
                    return (a === b) ? options.fn(this) : options.inverse(this);
                case "!==":
                    return (a !== b) ? options.fn(this) : options.inverse(this);
                case "<":
                    return (a < b) ? options.fn(this) : options.inverse(this);
                case "<=":
                    return (a <= b) ? options.fn(this) : options.inverse(this);
                case ">":
                    return (a > b) ? options.fn(this) : options.inverse(this);
                case ">=":
                    return (a >= b) ? options.fn(this) : options.inverse(this);
                case "&&":
                    return (a && b) ? options.fn(this) : options.inverse(this);
                case "||":
                    return (a || b) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        },

        /**
         * URL-encodes a string.
         * @param {string} string The string to encode.
         * @returns {string} The encoded string.
         */
        urlEncode: function(string) {
            return encodeURIComponent(string);
        },

        /**
         * Turns a Unix timestamp into a formatted date.
         * @param {number} timestamp The Unix timestamp to use.
         * @returns {string} The formatted date.
         */
        timestampToDate: function(timestamp) {
            return moment(timestamp * 1000).format("dddd, MMMM Do, YYYY h:mm:ss a");
        },

        /**
         * Returns the current year.
         * @returns {number} The current year.
         */
        year: function() {
            return new Date().getFullYear();
        },

        /**
         * Returns the Twitter profile of the user.
         * @param {string} user The Twitter user.
         * @returns {string} The Twitter profile of the user.
         */
        toTwitterProfileUrl: function(user) {
            return "http://twitter.com/" + user;
        },

        /**
         * Returns the permanent URL of a tweet.
         * @param {string} user The Twitter user.
         * @param {number} id The ID of the tweet.
         * @returns {string} The permanent URL of the tweet.
         */
        toTwitterPermanentUrl: function(user, id) {
            return "http://twitter.com/" + user + "/status/" + id;
        },

        /**
         * Returns the URL to use to reply to a tweet.
         * @param {number} id The ID of the tweet.
         * @returns {string} The URL to use to reply to a tweet.
         */
        toTwitterReplyUrl: function(id) {
            return "http://twitter.com/intent/tweet?in_reply_to=" + id;
        },

        /**
         * Returns the URL to use to retweet a tweet.
         * @param {number} id The ID of the tweet.
         * @returns {string} The URL to use to retweet a tweet.
         */
        toTwitterRetweetUrl: function(id) {
            return "http://twitter.com/intent/retweet?tweet_id=" + id;
        },

        /**
         * Returns the URL to use to favorite a tweet.
         * @param {number} id The ID of the tweet.
         * @returns {string} The URL to use to favorite a tweet.
         */
        toTwitterFavoriteUrl: function(id) {
            return "http://twitter.com/intent/favorite?tweet_id=" + id;
        },

        /**
         * Converts an ISO timestamp into an ABBR element to use with timeago.
         * @param {string} timestamp The ISO timestamp.
         * @returns {string} The ABBR element to use with timeago.
         */
        toTimeAgo: function(timestamp) {
            var date = new Date(timestamp);
            return "<abbr class=\"setTime\" title=\"" + timestamp.toString() + "\">" + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + "</abbr>";
        }
    };
};
