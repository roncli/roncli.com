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
                    error: "World of Warcraft character does not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets the information about the main character for Diablo.
 * @param {function} callback The callback function.
 */
module.exports.getDiabloMain = function(callback) {
    "use strict";

    /**
     * Gets the profile from the cache.
     * @param {function} failureCallback The failure callback when there are no posts.
     */
    var getProfile = function(failureCallback) {
        cache.get("roncli.com:battlenet:d3:profile", function(profile) {
            if (!profile) {
                failureCallback();
                return;
            }

            callback(null, profile);
        });
    };

    getProfile(function() {
        d3.cacheProfile(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getProfile(function() {
                callback({
                    error: "Diablo 3 profile does not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets the information about ranked League of Legends stats.
 * @param {function} callback The callback function.
 */
module.exports.getLolRanked = function(callback) {
    "use strict";

    var result = {},

        /**
         * Gets the champion history from the cache.
         * @param {function} failureCallback The failure callback when there are no posts.
         */
        getChampion = function(failureCallback) {
            cache.hget("roncli.com:riot:lol:champions", result.game.participants[0].championId, function(champion) {
                if (!champion) {
                    failureCallback();
                    return;
                }

                result.champion = champion;

                callback(null, result);
            });
        },

        /**
         * Gets the last game from the game history cache.
         * @param {function} failureCallback The failure callback when there are no posts.
         */
        getHistory = function(failureCallback) {
            cache.zrevrange("roncli.com:riot:lol:history", 0, 0, function(history) {
                if (!history) {
                    failureCallback();
                    return;
                }

                result.game = history[0];

                getChampion(function() {
                    lol.cacheChampion(false, result.game.participants[0].championId, function(err) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        getChampion(function() {
                            callback({
                                error: "League of Legends champions do not exist.",
                                status: 400
                            });
                        });
                    });
                });
            });
        },

        /**
         * Gets the ranked stats from the cache.
         * @param {function} failureCallback The failure callback when there are no posts.
         */
        getRanked = function(failureCallback) {
            cache.get("roncli.com:riot:lol:league", function(ranked) {
                if (!ranked) {
                    failureCallback();
                    return;
                }

                result.ranked = ranked;

                getHistory(function() {
                    failureCallback();
                });
            });
        };

    getRanked(function() {
        lol.cacheRanked(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getRanked(function() {
                callback({
                    error: "League of Legends ranked stats do not exist.",
                    status: 400
                });
            });
        });
    });
};
