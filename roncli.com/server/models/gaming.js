var wow = require("../battlenet/wow"),
    d3 = require("../battlenet/d3"),
    steam = require("../steam/steam"),
    dcl = require("../dcl/dcl"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,
    classNames = {
        barbarian: "Barbarian",
        crusader: "Crusader",
        "demon-hunter": "Demon Hunter",
        monk: "Monk",
        necromancer: "Necromancer",
        "witch-doctor": "Witch Doctor",
        wizard: "Wizard"
    },

    /**
     * Gets the character from the cache.
     * @param {function} callback The callback function.
     * @param {function} failureCallback The failure callback function.
     */
    getWowCharacter = function(callback, failureCallback) {
        "use strict";

        cache.get("roncli.com:battlenet:wow:character", function(character) {
            if (!character) {
                failureCallback();
                return;
            }

            callback(character);
        });
    },

    /**
     * Gets an item from the cache.
     * @param {object} feedItem The feed item.
     * @param {function} callback The callback function.
     * @param {function} failureCallback The failure callback function.
     */
    getWowItem = function(feedItem, callback, failureCallback) {
        "use strict";

        cache.get("roncli.com:battlenet:wow:item:" + feedItem.itemId, function(item) {
            if (!item) {
                failureCallback();
                return;
            }

            callback({
                type: feedItem.type,
                timestamp: feedItem.timestamp,
                itemId: feedItem.itemId,
                item: item.name,
                icon: item.icon
            });
        });
    },

    /**
     * Gets feed item data.
     * @param {object} feedItem The feed item from the cache.
     * @param {function} callback The callback function.
     */
    getWowFeedItem = function(feedItem, callback) {
        "use strict";

        var matches, boss,

            /**
             * Returns the item.
             * @param {object} item The item to return.
             */
            returnItem = function(item) {
                callback(null, item);
            };

        switch (feedItem.type) {
            case "ACHIEVEMENT":
                callback(null, {
                    type: feedItem.type,
                    timestamp: feedItem.timestamp,
                    achievement: feedItem.achievement.title,
                    icon: feedItem.achievement.icon
                });
                break;
            case "BOSSKILL":
                matches = /^(.*) kills \(.*\)$/.exec(feedItem.achievement.title);
                boss = matches ? matches[1] : feedItem.achievement.title;
                callback(null, {
                    type: feedItem.type,
                    timestamp: feedItem.timestamp,
                    boss: boss
                });
                break;
            case "LOOT":
                getWowItem(feedItem, returnItem, function() {
                    wow.cacheItem(false, feedItem.itemId, function(err) {
                        if (err) {
                            callback(err);
                            return;
                        }

                        getWowItem(feedItem, returnItem, function() {
                            callback({
                                error: "Item does not exist.",
                                status: 400
                            });
                        });
                    });
                });
                break;
        }
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
 * Forces the site to cache the DCL data, even if it is already cached.
 * @param {function} callback The callback function.
 */
module.exports.forceCacheDcl = function(callback) {
    "use strict";

    dcl.cachePilot(true, callback);
};

/**
 * Gets all of the WoW feed items.
 * @param {function} callback The callback function.
 */
module.exports.getWowFeed = function(callback) {
    "use strict";

    var result = {id: 1},

        /**
         * Gets the feed for the character from the cache.
         * @param {object} character The character object.
         */
        getFeed = function(character) {
            result.character = character;

            cache.zrevrange("roncli.com:battlenet:wow:feed", 0, -1, function(feedItems) {
                var fxs = [];

                result.feedItems = [];

                feedItems.forEach(function(feedItem) {
                    fxs.push((function() {
                        var deferred = new Deferred();

                        getWowFeedItem(feedItem, function(err, item) {
                            if (err) {
                                deferred.reject(err);
                                return;
                            }

                            result.feedItems.push(item);
                            deferred.resolve();
                        });

                        return deferred.promise;
                    }()));
                });

                all(fxs).then(
                    function() {
                        result.feedItems.sort(function(a, b) {
                            return b.timestamp - a.timestamp;
                        });
                        callback(null, [result]);
                    },

                    // If any of the functions error out, it will be handled here.
                    function(err) {
                        callback(err);
                    }
                );
            });
        };

    getWowCharacter(getFeed, function() {
        wow.cacheCharacter(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getWowCharacter(getFeed, function() {
                callback({
                    error: "World of Warcraft character does not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets the latest WoW feed item.
 * @param {function} callback The callback function.
 */
module.exports.getLatestWowFeed = function(callback) {
    "use strict";

    var result = {id: 1},

        /**
         * Gets the feed for the character from the cache.
         * @param {object} character The character object.
         */
        getFeed = function(character) {
            var deferred = new Deferred();

            result.character = character;

            cache.keys("roncli.com:battlenet:wow:feed", function(keys) {
                if (keys.length > 0) {
                    deferred.resolve();
                } else {
                    wow.cacheCharacter(true, function(err) {
                        if (err) {
                            deferred.reject(err);
                            return;
                        }

                        deferred.resolve();
                    });
                }
            });

            deferred.then(
                function() {
                    cache.zrevrange("roncli.com:battlenet:wow:feed", 0, 0, function(feedItem) {
                        if (feedItem && feedItem.length === 0) {
                            callback(null, result);
                            return;
                        }

                        getWowFeedItem(feedItem[0], function(err, item) {
                            if (err) {
                                callback(err);
                                return;
                            }

                            result.feedItem = item;

                            callback(null, [result]);
                        });
                    });
                },
                
                function(err) {
                    callback(err);
                }
            );
        };

    getWowCharacter(getFeed, function() {
        wow.cacheCharacter(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getWowCharacter(getFeed, function() {
                callback({
                    error: "World of Warcraft character does not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets basic data about characters in Diablo.
 * @param {function} callback The callback function.
 */
module.exports.getDiabloHeroes = function(callback) {
    "use strict";
    
    /**
     * Gets the heroes from the cache.
     * @param {function} failureCallback The failure callback function.
     */
    var getHeroes = function(failureCallback) {
        cache.hgetall("roncli.com:battlenet:d3:heroes", function(heroes) {
            var key, hero, results = [];
            
            if (!heroes) {
                failureCallback();
                return;
            }
            
            for (key in heroes) {
                if (heroes.hasOwnProperty(key)) {
                    hero = heroes[key];
                    results.push({
                        id: hero.id,
                        seasonal: hero.seasonal,
                        hardcore: hero.hardcore,
                        paragonLevel: hero.paragonLevel,
                        name: hero.name,
                        "class": classNames[hero.class],
                        lastUpdated: hero["last-updated"] * 1000
                    });
                }
            }

            results.sort(function(a, b) {
                return b.lastUpdated - a.lastUpdated;
            });

            callback(null, results);
        });
    };

    getHeroes(function() {
        d3.cacheProfile(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getHeroes(function() {
                callback({
                    error: "Diablo 3 heroes do not exist.",
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

            callback(null, [{
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
            }]);
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
 * Gets the Steam games.
 * @param {function} callback The callback function.
 */
module.exports.getSteamGames = function(callback) {
    "use strict";

    /**
     * Gets the Steam games from the cache.
     * @param {function} failureCallback The failure callback function.
     */
    var getGames = function(failureCallback) {
        cache.zrevrange("roncli.com:steam:games", 0, -1, function(games) {
            if (!games || games.length === 0) {
                failureCallback();
                return;
            }

            callback(null, games.map(function(game) {
                return {
                    appId: game.appId,
                    name: game.name,
                    image: game.header,
                    url: "/steam/" + game.appId + "/" + game.name.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-/, "").replace(/-$/, "").toLowerCase()
                };
            }));
        });
    };

    getGames(function() {
        steam.cacheGames(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getGames(function() {
                callback({
                    error: "Steam games do not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets data for a Steam game.
 * @param {number} gameId The Steam game ID.
 * @param {function} callback The callback function.
 */
module.exports.getSteamGame = function(gameId, callback) {
    "use strict";

    /**
     * Gets the Steam game from the cache.
     * @param {function} failureCallback The failure callback function.
     */
    var getGame = function(failureCallback) {
        cache.hmget("roncli.com:steam:gameInfo", [gameId], function(games) {
            var gameInfo;

            if (!games || games.length === 0 || !games[0]) {
                failureCallback();
                return;
            }

            gameInfo = games[0];

            cache.get("roncli.com:steam:game:" + gameId, function(game) {
                var earnedAchievements = {};

                if (!game) {
                    failureCallback();
                    return;
                }

                if (game.stats.achievements && game.stats.achievements.length > 0) {
                    game.stats.achievements.forEach(function(achievement) {
                        if (achievement.achieved) {
                            earnedAchievements[achievement.name] = true;
                        }
                    });
                }

                if (game.schema.availableGameStats.achievements && game.schema.availableGameStats.achievements.length > 0) {
                    game.schema.availableGameStats.achievements.forEach(function(achievement) {
                        if (earnedAchievements[achievement.name]) {
                            achievement.achieved = true;
                        }
                    });
                }

                callback(null, {
                    id: gameId,
                    name: gameInfo.name,
                    playtimeTwoWeeks: gameInfo.playtimeTwoWeeks,
                    playtimeForever: gameInfo.playtimeForever,
                    header: gameInfo.header,
                    achievements: {
                        earned: game.schema.availableGameStats.achievements ? game.schema.availableGameStats.achievements.filter(function(achievement) {
                            return achievement.achieved;
                        }).sort(function(a, b) {
                            return a.displayName.localeCompare(b.displayName);
                        }) : [],
                        unearned: game.schema.availableGameStats.achievements ? game.schema.availableGameStats.achievements.filter(function(achievement) {
                            return !achievement.achieved;
                        }).sort(function(a, b) {
                            return a.displayName.localeCompare(b.displayName);
                        }) : []
                    }
                });
            });
        });
    };

    getGame(function() {
        steam.cacheGame(false, gameId, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getGame(function() {
                callback({
                    error: "Steam game does not exist.",
                    status: 400
                });
            });
        });
    });
};

/**
 * Gets pilot information from the DCL.
 * @param {boolean} latest Whether to only get the latest match.
 * @param {function} callback The callback function.
 */
module.exports.getDclPilot = function(latest, callback) {
    "use strict";

    /**
     * Gets the DCL pilot from the cache.
     * @param {function} failureCallback The failure callback function.
     */
    var getPilot = function(failureCallback) {
        cache.get("roncli.com:dcl:pilot", function(pilot) {
            if (!pilot || !pilot.name) {
                failureCallback();
                return;
            }

            if (latest) {
                pilot.match = pilot.matches[0];
                delete pilot.matches;
            }

            callback(null, [pilot]);
        });
    };

    getPilot(function() {
        dcl.cachePilot(false, function(err) {
            if (err) {
                callback(err);
                return;
            }

            getPilot(function() {
                callback({
                    error: "DCL pilot does not exist.",
                    status: 400
                });
            });
        });
    });
};
