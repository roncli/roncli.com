var wow = require("../battlenet/wow"),
    d3 = require("../battlenet/d3"),
    lol = require("../riot/lol"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    classNames = {
        barbarian: "Barbarian",
        crusader: "Crusader",
        "demon-hunter": "Demon Hunter",
        monk: "Monk",
        "witch-doctor": "Witch Doctor",
        wizard: "Wizard"
    },
    tierNames = {
        CHALLENGER: "Challenger",
        MASTER: "Master",
        DIAMOND: "Diamond",
        PLATINUM: "Platinum",
        GOLD: "Gold",
        SILVER: "Silver",
        BRONZE: "Bronze"
    },

    /**
     * Gets the latest version of the API.
     * @param {function} callback The callback function.
     */
    getVersion = function(callback) {
        "use strict";

        /**
         * Gets the latest version of the API from the cache.
         * @param {function} failureCallback The failure callback function.
         */
        var getVersion = function(failureCallback) {
            cache.get("roncli.com:riot:lol:version", function(version) {
                if (!version) {
                    failureCallback();
                    return;
                }

                callback(null, version);
            });
        };

        getVersion(function() {
            lol.cacheVersion(false, function(err) {
                if (err) {
                    callback(err);
                    return;
                }

                getVersion(function() {
                    callback({
                        error: "League of Legends version does not exist.",
                        status: 400
                    });
                });
            });
        });
    };

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
         * @param {function} failureCallback The failure callback function.
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
                         * @param {function} failureCallback The failure callback function.
                         */
                        getItem = function(failureCallback) {
                            cache.get("roncli.com:battlenet:wow:item:" + feedItem[0].itemId, function(item) {
                                if (!item) {
                                    failureCallback();
                                    return;
                                }

                                result.feedItem = {
                                    type: feedItem[0].type,
                                    timestamp: feedItem[0].timestamp,
                                    itemId: feedItem[0].itemId,
                                    item: item.name,
                                    icon: item.icon
                                };

                                deferred.resolve(true);
                            });
                        };

                    switch (feedItem[0].type) {
                        case "ACHIEVEMENT":
                            result.feedItem = {
                                type: feedItem[0].type,
                                timestamp: feedItem[0].timestamp,
                                achievement: feedItem[0].achievement.title,
                                icon: feedItem[0].achievement.icon
                            };
                            deferred.resolve(true);
                            break;
                        case "BOSSKILL":
                            matches = /^(.*) kills \(.*\)$/.exec(feedItem[0].achievement.title);
                            boss = matches ? matches[1] : feedItem[0].achievement.title;
                            result.feedItem = {
                                type: feedItem[0].type,
                                timestamp: feedItem[0].timestamp,
                                boss: boss
                            };
                            deferred.resolve(true);
                            break;
                        case "LOOT":
                            getItem(function() {
                                wow.cacheItem(false, feedItem[0].itemId, function(err) {
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
     * @param {function} failureCallback The failure callback function.
     */
    var getProfile = function(failureCallback) {
        cache.get("roncli.com:battlenet:d3:profile", function(profile) {
            if (!profile) {
                failureCallback();
                return;
            }

            callback(null, {
                seasonal: profile.seasonal,
                hardcore: profile.hardcore,
                paragonLevel: profile.hero.paragonLevel,
                name: profile.hero.name,
                "class": classNames[profile.hero.class],
                lastUpdated: profile.hero["last-updated"] * 1000,
                damage: profile.heroData.stats.damage,
                toughness: profile.heroData.stats.toughness,
                healing: profile.heroData.stats.healing,
                eliteKills: profile.heroData.kills.elites
            });
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
module.exports.getLatestLolRanked = function(callback) {
    "use strict";

    var result = {},

        /**
         * Gets the champion history from the cache.
         * @param {function} failureCallback The failure callback function.
         */
        getChampion = function(failureCallback) {
            cache.hget("roncli.com:riot:lol:champions", result.game.championId, function(champion) {
                if (!champion) {
                    failureCallback();
                    return;
                }

                getVersion(function(err, version) {
                    if (err) {
                        callback(err);
                        return;
                    }

                    result.champion = {
                        name: champion.name,
                        image: "//ddragon.leagueoflegends.com/cdn/" + version + "/img/champion/" + champion.image.full
                    };

                    callback(null, result);
                });
            });
        },

        /**
         * Gets the last game from the game history cache.
         * @param {function} failureCallback The failure callback function.
         */
        getHistory = function(failureCallback) {
            cache.zrevrange("roncli.com:riot:lol:history", 0, 0, function(history) {
                if (!history) {
                    failureCallback();
                    return;
                }

                result.game = {
                    matchCreation: history[0].matchCreation,
                    matchDuration: {
                        minutes: Math.floor(history[0].matchDuration / 60),
                        seconds: history[0].matchDuration % 60 < 10 ? "0" + history[0].matchDuration % 60 : history[0].matchDuration % 60
                    },
                    winner: history[0].participants[0].stats.winner,
                    kills: history[0].participants[0].stats.kills,
                    deaths: history[0].participants[0].stats.deaths,
                    assists: history[0].participants[0].stats.assists,
                    goldPerMinute: (60 * history[0].participants[0].stats.goldEarned / history[0].matchDuration).toFixed(2),
                    championId: history[0].participants[0].championId
                };

                getChampion(function() {
                    lol.cacheChampion(false, result.game.championId, function(err) {
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
         * @param {function} failureCallback The failure callback function.
         */
        getRanked = function(failureCallback) {
            cache.get("roncli.com:riot:lol:league", function(ranked) {
                if (!ranked) {
                    failureCallback();
                    return;
                }

                result.ranked = {
                    tier: tierNames[ranked.tier],
                    division: ranked.entries[0].division,
                    leaguePoints: ranked.entries[0].leaguePoints,
                    wins: ranked.entries[0].wins,
                    losses: ranked.entries[0].losses,
                    isHotStreak: ranked.entries[0].isHotStreak
                };

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
