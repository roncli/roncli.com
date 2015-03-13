var wow = require("../battlenet/wow"),
    d3 = require("../battlenet/d3"),
    lol = require("../riot/lol"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred;

/**
 * Forces the site to cache the character, even if it is already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheCharacter = function(callback) {
    "use strict";

    wow.cacheCharacter(true, callback);
};

/**
 * Forces the site to cache the profile, even if it is already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheProfile = function(callback) {
    "use strict";

    d3.cacheProfile(true, callback);
};

/**
 * Forces the site to cache the ranked data, even if it is already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheRanked = function(callback) {
    "use strict";

    lol.cacheRanked(true, callback);
};

/**
 * Forces the site to cache the ranked data, even if it is already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheChampions = function(callback) {
    "use strict";

    lol.cacheChampions(true, callback);
};

/**
 * Gets the latest WoW feed item.
 * @param {function} callback The callback function.
 */
module.exports.getLatestWowFeed = function(callback) {
    "use strict";

    var result = {},

        /**
         * Gets the character from the cache.
         * @param {function} failureCallback The failure callback when there are no posts.
         */
        getCharacter = function(failureCallback) {
            cache.get("roncli.com:battlenet:wow:character", function(character) {
                if (!character) {
                    failureCallback();
                    return;
                }

                result.character = character;

                cache.zrevrange("roncli.com:battlenet:wow:feed", 0, 1, function(feedItem) {
                    var deferred = new Deferred(),
                        matches, boss,

                        /**
                         * Gets an item from the cache.
                         * @param {function} failureCallback The failure callback when there are no posts.
                         */
                        getItem = function(failureCallback) {
                            cache.get("roncli.com:battlenet:wow:item:" + feedItem.itemId, function(item) {
                                if (!item) {
                                    failureCallback();
                                    return;
                                }

                                result.feedItem = {
                                    type: feedItem.type,
                                    timestamp: feedItem.timestamp,
                                    itemId: feedItem.itemId,
                                    item: item.name
                                };

                                deferred.resolve(true);
                            });
                        };

                    switch (feedItem.type) {
                        case "ACHIEVEMENT":
                            result.feedItem = {
                                type: feedItem.type,
                                timestamp: feedItem.timestamp,
                                achievement: feedItem.achievement.title,
                                icon: feedItem.achievement.icon
                            };
                            deferred.resolve(true);
                            break;
                        case "BOSSKILL":
                            matches = /^(.*) kills \(.*\)$/.exec(feedItem.achievement.title);
                            boss = matches ? matches[1] : feedItem.achievement.title;
                            result.feedItem = {
                                type: feedItem.type,
                                timestamp: feedItem.timestamp,
                                boss: boss
                            };
                            deferred.resolve(true);
                            break;
                        case "LOOT":
                            getItem(function() {
                                wow.cacheItem(false, feedItem.itemId, function(err) {
                                    if (err) {
                                        deferred.reject(err);
                                        return;
                                    }

                                    getItem(function() {
                                        deferred.reject({
                                            error: "Item does not exist.",
                                            status: 400
                                        });
                                    });
                                });
                            });
                            break;
                    }

                    deferred.promise.then(
                        function() {
                            callback(null, result);
                        },

                        function(err) {
                            callback(err);
                        }
                    );
                });
            });
        };

    getCharacter(function() {
        wow.cacheCharacter(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getCharacter(function() {
                callback({
                    error: "Character does not exist.",
                    status: 400
                });
            });
        });
    });
};
