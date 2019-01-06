var blizzhub = require("./blizzhub"),
    wow = require("blizzhub/lib").Wow,
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Caches the character from Battle.Net.
     * @param {function} callback The callback function.
     */
    cacheCharacter = function(callback) {
        "use strict";

        blizzhub.getToken(function(err, token) {
            var wowCharacter;

            if (err || !token) {
                callback(err);
                return;
            }

            wowCharacter = new wow.CharacterProfile(token);

            wowCharacter.getCharacterProfile("us", "sen'jin", "Roncli", "en_US", "feed").then(function(resultJson) {
                var result = JSON.parse(resultJson),
                    character, feed;

                if (!result || !result.thumbnail) {
                    console.log("Bad response from Battle.Net while getting the character, no result found.");
                    callback({
                        error: "Bad response from Battle.Net.",
                        status: 200
                    });
                    return;
                }
    
                character = {
                    achievementPoints: result.achievementPoints,
                    thumbnail: "https://render-us.worldofwarcraft.com/character/" + result.thumbnail,
                    profile: "https://render-us.worldofwarcraft.com/character/" + result.thumbnail.replace("avatar.jpg", "profilemain.jpg")
                };
    
                feed = result.feed.filter(function(item) {
                    return ["ACHIEVEMENT", "BOSSKILL", "LOOT"].indexOf(item.type) !== -1;
                }).map(function(item) {
                    return {
                        score: item.timestamp,
                        value: item
                    };
                });
    
                all(
                    (function() {
                        var deferred = new Deferred();
    
                        cache.set("roncli.com:battlenet:wow:character", character, 86400, function() {
                            deferred.resolve(true);
                        });
    
                        return deferred.promise;
                    }()),
    
                    (function() {
                        var deferred = new Deferred();
    
                        cache.del(["roncli.com:battlenet:wow:feed"], function() {
                            cache.zadd("roncli.com:battlenet:wow:feed", feed, 86400, function() {
                                deferred.resolve(true);
                            });
                        });
    
                        return deferred.promise;
                    }())
                ).then(function() {
                    callback();
                });
            }).catch(function(err) {
                console.log("Bad response from Battle.Net while getting the character.");
                console.log(err);
                callback({
                    error: "Bad response from Battle.Net.",
                    status: 200
                });
            });
        });
    },

    /**
     * Caches an item from Battle.Net.
     * @param {string} itemId The Item ID to cache.
     * @param {function} callback The callback function.
     */
    cacheItem = function(itemId, callback) {
        "use strict";

        var getItem = function(itemIdWithContext, callback) {
            blizzhub.getToken(function(err, token) {
                var wowItem;

                if (err || !token) {
                    callback(err);
                    return;
                }

                wowItem = new wow.Item(token);

                wowItem.getItem("us", itemIdWithContext, "en_US").then(function(itemJson) {
                    var item = JSON.parse(itemJson);

                    if (!item) {
                        console.log("Bad response from Battle.Net while getting the item, no item found.");
                        console.log(err);
                        callback({
                            error: "Bad response from Battle.Net.",
                            status: 200
                        });
                        return;
                    }
    
                    if (item.name) {
                        callback(null, item);
                        return;
                    }
    
                    if (item.availableContexts && item.availableContexts.length > 0) {
                        getItem(itemIdWithContext + "/" + item.availableContexts[0], callback);
                    }
                }).catch(function(err) {
                    console.log("Bad response from Battle.Net while getting the item.");
                    console.log(err);
                    callback({
                        error: "Bad response from Battle.Net.",
                        status: 200
                    });
                });
            });
        };

        getItem(itemId, function(err, item) {
            if (err) {
                callback(err);
                return;
            }

            cache.set("roncli.com:battlenet:wow:item:" + itemId, item, 2592000, function() {
                callback();
            });
        });
    };

/**
 * Ensures that the character is cached.
 * @param {boolean} force Forces the caching of the character.
 * @param {function} callback The callback function.
 */
module.exports.cacheCharacter = function(force, callback) {
    "use strict";

    if (force) {
        cacheCharacter(callback);
        return;
    }

    cache.keys("roncli.com:battlenet:wow:character", function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cacheCharacter(callback);
    });
};

/**
 * Ensures that the item is cached.
 * @param {boolean} force Forces the caching of the item.
 * @param {number} itemId The item ID to cache.
 * @param {function} callback The callback function.
 */
module.exports.cacheItem = function(force, itemId, callback) {
    "use strict";

    if (force) {
        cacheItem(itemId, callback);
        return;
    }

    cache.keys("roncli.com:battlenet:wow:item:" + itemId, function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cacheItem(itemId, callback);
    });
};
