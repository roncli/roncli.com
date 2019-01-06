var blizzhub = require("./blizzhub"),
    d3 = require("blizzhub/lib").Diablo3,
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Caches the profile from Battle.Net.
     * @param {function} callback The callback function.
     */
    cacheProfile = function(callback) {
        "use strict";

        blizzhub.getToken(function(err, token) {
            var d3Profile;

            if (err || !token) {
                callback(err);
                return;
            }

            d3Profile = new d3.Profile(token);

            d3Profile.getApiAccount("us", "roncli-1818", "en_US").then(function(profileJson) {
                var profile = JSON.parse(profileJson),
                    profileDeferred = new Deferred(),
                    heroesDeferred = new Deferred(),
                    levels, result, seasonalProfile, index, characterClass;

                if (!profile || !profile.heroes) {
                    console.log("Bad response from Battle.Net while getting the career, no profile found.");
                    callback({
                        error: "Bad response from Battle.Net.",
                        status: 200
                    });
                    return;
                }

                // Determine what to store.  Seasonal before non-seasonal, hardcore if it's higher than softcore.
                levels = [
                    profile.paragonLevel,
                    profile.paragonLevelHardcore,
                    profile.paragonLevelSeason,
                    profile.paragonLevelSeasonHardcore
                ];

                result = {
                    seasonal: levels[2] || levels[3] ? true : false,
                    hardcore: levels[2] || levels[3] ? (levels[3] >= levels[2]) : (levels[1] >= levels[0])
                };

                if (result.seasonal) {
                    for (index in profile.seasonalProfiles) {
                        if (profile.seasonalProfiles.hasOwnProperty(index)) {
                            if (!seasonalProfile || profile.seasonalProfiles[index].seasonId > seasonalProfile.seasonId) {
                                seasonalProfile = profile.seasonalProfiles[index];
                            }
                        }
                    }
                } else {
                    for (index in profile.seasonalProfiles) {
                        if (profile.seasonalProfiles.hasOwnProperty(index)) {
                            if (profile.seasonalProfiles[index].seasonId === 0) {
                                seasonalProfile = profile.seasonalProfiles[index];
                                break;
                            }
                        }
                    }
                }

                // Get the class that has the most play time this season.
                characterClass = Object.keys(seasonalProfile.timePlayed).map(function(c) {
                    return {class: c, timePlayed: seasonalProfile.timePlayed[c]};
                }).sort(function(a, b) {
                    return b.timePlayed - a.timePlayed;
                })[0].class;

                // Get the most recent hero played that matches the seasonal, hardcore, and class values.
                result.hero = profile.heroes.filter(function(hero) {
                    return hero.seasonal === result.seasonal && hero.hardcore === result.hardcore && hero.class === characterClass;
                }).sort(function(a, b) {
                    return b["last-updated"] - a["last-updated"];
                })[0];

                // Get the hero.
                d3Profile.getApiHero("us", "roncli-1818", result.hero.id, "en_US").then(function(heroJson) {
                    var hero = JSON.parse(heroJson);

                    if (err || !hero) {
                        console.log("Bad response from Battle.Net while getting the profile, no hero found.");
                        console.log(err);
                        profileDeferred.reject({
                            error: "Bad response from Battle.Net.",
                            status: 200
                        });
                        return;
                    }

                    result.heroData = hero;

                    cache.set("roncli.com:battlenet:d3:profile", result, 86400, function() {
                        profileDeferred.resolve();
                    });
                }).catch(function(err) {
                    console.log("Bad response from Battle.Net while getting the profile.");
                    console.log(err);
                    profileDeferred.reject({
                        error: "Bad response from Battle.Net.",
                        status: 200
                    });
                });

                // Cache the basic hero data.
                cache.hmset("roncli.com:battlenet:d3:heroes", profile.heroes.map(function(hero) {
                    return {key: hero.id, value: hero};
                }), 86400, function() {
                    heroesDeferred.resolve();
                });
                
                all([profileDeferred.promise, heroesDeferred.promise]).then(
                    function() {
                        callback();
                    },

                    // If any of the functions error out, it will be handled here.                
                    function(err) {
                        callback(err);
                    }
                );

            }).catch(function(err) {
                console.log("Bad response from Battle.Net while getting the career.");
                console.log(err);
                callback({
                    error: "Bad response from Battle.Net.",
                    status: 200
                });
                return;
            });
        });
    },

    /**
     * Caches an item from Battle.Net.
     * @param {string} itemString The Item string to cache.
     * @param {function} callback The callback function.
     */
    cacheItem = function(itemString, callback) {
        "use strict";

        blizzhub.getToken(function(err, token) {
            var d3Item;

            if (err || !token) {
                callback(err);
                return;
            }

            d3Item = new d3.Item(token);

            d3Item.getItem("us", itemString, "en_US").then(function(itemJson) {
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
    
                cache.set("roncli.com:battlenet:d3:item:" + itemString, item, 2592000, function() {
                    callback();
                });
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

/**
 * Ensures that the profile is cached.
 * @param {boolean} force Forces the caching of the profile.
 * @param {function} callback The callback function.
 */
module.exports.cacheProfile = function(force, callback) {
    "use strict";

    if (force) {
        cacheProfile(callback);
        return;
    }

    cache.keys("roncli.com:battlenet:d3:profile", function(keys) {
        if (keys && keys.length > 0) {
            cache.keys("roncli.com:battlenet:d3:heroes", function(keys) {
                if (keys && keys.length > 0) {
                    callback();
                    return;
                }

                cacheProfile(callback);
            });
        }

        cacheProfile(callback);
    });
};

/**
 * Ensures that the item is cached.
 * @param {boolean} force Forces the caching of the item.
 * @param {string} itemString The item string to cache.
 * @param {function} callback The callback function.
 */
module.exports.cacheItem = function(force, itemString, callback) {
    "use strict";

    if (force) {
        cacheItem(itemString, callback);
        return;
    }

    cache.keys("roncli.com:battlenet:d3:item:" + itemString, function(keys) {
        if (keys && keys.length > 0) {
            callback();
            return;
        }

        cacheItem(itemString, callback);
    });
};
