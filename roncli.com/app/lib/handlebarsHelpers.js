var moment = require("moment"),
    sanitizeHtml = require("sanitize-html"),
    pjson = require("../../package.json"),
    _ = require("underscore");

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
         * @param {string|Array} values If an array, returns one meta tag whose value is each element of the array.  Otherwise, the value of the sole meta tag.
         * @returns {string} The meta tags.
         */
        metaTags: function(key, values) {
            var tags;

            if (values instanceof Array) {
                tags = [];
                values.forEach(function(value) {
                    tags.push("<meta name=\"" + key + "\" content=\"" + _.escape(value) + "\"/>");
                });
                return tags.join("");
            }

            return "<meta name=\"" + key + "\" content=\"" + _.escape(values) + "\"/>";
        },

        /**
         * Returns the JSON object stringified.
         * This is a workaround for https://github.com/rendrjs/rendr-handlebars/pull/14.
         * @param {object} object The JSON object.
         * @param {string|number} spacing The spacing to use to stringify the JSON.
         * @returns {base.HandlebarsEnvironment.SafeString} The stringified JSON object.
         */
        jsonEscaped: function(object, spacing) {
            return new Handlebars.SafeString(JSON.stringify(object, null, spacing).replace("/script", "\\/script") || 'null');
        },

        /**
         * Sanitizes HTML by only allowing a subset of elements and attributes.
         * @param {string} string The string to sanitize.
         * @returns {base.HandlebarsEnvironment.SafeString} The stringified JSON object.
         */
        sanitize: function(string) {
            var attributes = sanitizeHtml.defaults.allowedAttributes;
            attributes.p = ["style"];
            attributes.span = ["style"];

            return new Handlebars.SafeString(
                sanitizeHtml(string, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "u", "sup", "sub", "strike", "address", "span"]),
                    allowedAttributes: attributes
                })
            );
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
         * Turns a timestamp in milliseconds from Unix epoch into a formatted date.
         * @param {number} timestamp The number of milliseconds from Unix epoch.
         * @param {string} [format] The optional format to use.
         * @returns {string} The formatted date.
         */
        timestampToDate: function(timestamp, format) {
            if (typeof format !== "string") {
                format = "dddd, MMMM Do, YYYY h:mm:ss a";
            }
            return moment(timestamp).format(format);
        },

        /**
         * Returns the current year.
         * @returns {number} The current year.
         */
        year: function() {
            return new Date().getFullYear();
        },

        /**
         * Returns the version of the application.
         * @returns {string} The version.
         */
        version: function() {
            return pjson.version;
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
            if (!timestamp) {
                return "";
            }
            var date = new Date(timestamp);
            return "<abbr class=\"setTime\" title=\"" + date.toISOString() + "\">" + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + "</abbr>";
        },

        /**
         * Returns whether to do something every so many iterations.
         * @param {number} count The number of iterations to perform the action.
         * @param {number} index The index of the current iteration.
         * @param {boolean} isLast Whether this is the last iteration.
         * @param {object} options The Handlebars helpers object.
         */
        every: function(count, index, isLast, options) {
            return (!isLast && index % count === count - 1) ? options.fn(this) : options.inverse(this);
        },

        /**
         * Returns text with line breaks replaced by BRs.
         * @param {string} text The string to replace.
         * @returns {base.HandlebarsEnvironment.SafeString} The string with line breaks replaced.
         */
        showText: function(text) {
            return new Handlebars.SafeString(text.replace(/(\r\n|\n|\r)/gm, "<br />"));
        },

        /**
         * Returns text indicating the size of a file.
         * @param {number} size The size of a file.
         */
        formatBytes: function(size) {
            if (size <= 0) {
                return "0 bytes";
            }
            if (size === 1) {
                return "1 byte";
            }
            if (size < 1000) {
                return size + " bytes";
            }

            if (size < 1024 * 10) {
                return (Math.floor(size / 10.24) / 100).toFixed(2) + " KB";
            }
            if (size < 1024 * 100) {
                return (Math.floor(size / 102.4) / 10).toFixed(1) + " KB";
            }
            if (size < 1024 * 1000) {
                return (Math.floor(size / 1024)).toFixed(0) + " KB";
            }

            if (size < Math.pow(1024, 2) * 10) {
                return (Math.floor(size / (1024 * 10.24)) / 100).toFixed(2) + " MB";
            }
            if (size < Math.pow(1024, 2) * 100) {
                return (Math.floor(size / (1024 * 102.4)) / 10).toFixed(1) + " MB";
            }
            if (size < Math.pow(1024, 2) * 1000) {
                return (Math.floor(size / (1024 * 1024))).toFixed(0) + " MB";
            }

            if (size < Math.pow(1024, 3) * 10) {
                return (Math.floor(size / (Math.pow(1024, 2) * 10.24)) / 100).toFixed(2) + " GB";
            }
            if (size < Math.pow(1024, 3) * 100) {
                return (Math.floor(size / (Math.pow(1024, 2) * 102.4)) / 10).toFixed(1) + " GB";
            }
            if (size < Math.pow(1024, 3) * 1000) {
                return (Math.floor(size / (Math.pow(1024, 2) * 1024))).toFixed(0) + " GB";
            }

            if (size < Math.pow(1024, 4) * 10) {
                return (Math.floor(size / (Math.pow(1024, 3) * 10.24)) / 100).toFixed(2) + " TB";
            }
            if (size < Math.pow(1024, 4) * 100) {
                return (Math.floor(size / (Math.pow(1024, 3) * 102.4)) / 10).toFixed(1) + " TB";
            }
            return (Math.floor(size / (Math.pow(1024, 3) * 1024))).toFixed(0) + " TB";
        },

        /**
         * Turns a string to lower case.
         * @param {string} str The string to turn to lower case.
         * @returns {string} The string in lower case.
         */
        toLower: function(str) {
            return str.toLowerCase();
        },

        /**
         * Turns a string to title case.
         * @param {string} str The string to turn to lower case.
         * @returns {string} The string in lower case.
         */
        titleCase: function(str) {
            return str.substring(0, 1).toUpperCase() + str.substring(1);
        }
    };
};
