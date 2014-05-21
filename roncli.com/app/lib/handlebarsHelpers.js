var $ = require("jquery");

/**
 * Helpers for handlebars rendering.
 * @param {object} Handlebars The Handlebars object.
 * @returns {object} The helper functions to use with Handlebars.
 */
module.exports = function(Handlebars) {
    "use strict";

    return {
        /**
         * Returns the current year.
         * @returns {number} The current year.
         */
        year: function() {
            return new Date().getFullYear();
        },

        toTwitterProfileUrl: function(user) {
            return "http://twitter.com/" + user;
        },

        toTwitterPermanentUrl: function(user, id) {
            return "http://twitter.com/" + user + "/status/" + id;
        },

        toTwitterReplyUrl: function(id) {
            return "http://twitter.com/intent/tweet?in_reply_to=" + id;
        },

        toTwitterRetweetUrl: function(id) {
            return "http://twitter.com/intent/retweet?tweet_id=" + id;
        },

        toTwitterFavoriteUrl: function(id) {
            return "http://twitter.com/intent/favorite?tweet_id=" + id;
        },

        toTimeAgo: function(timestamp) {
            var date = new Date(timestamp);
            return $("<abbr></abbr>").addClass("setTime").attr({title: timestamp}).text((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear())[0].outerHTML;
        }
    };
};
