var config = require("../privateConfig").steam,
    steam = require("steam-api"),
    userStats = new steam.UserStats(config.apikey, "76561197996696153"),
    player = new steam.Player(config.apikey, "76561197996696153"),
    cache = require("../cache/cache"),
    promise = require("promised-io/promise"),
    Deferred = promise.Deferred,
    all = promise.all,

    /**
     * Caches the Steam games.
     * @param callback The callback function.
     */
    cacheGames = function(callback) {
        "use strict";

        player.GetOwnedGames("76561197996696153", true, true).then(function(games) {
            var gamesToAdd = [],
                gameInfo = [];

            games.forEach(function(game) {
                if (game.appId !== 2430 && game.playtimeForever > 0) {
                    game.header = "http://cdn.akamai.steamstatic.com/steam/apps/" + game.appId + "/header.jpg";
                    gamesToAdd.push(game);
                    gameInfo.push({
                        key: game.appId,
                        value: {
                            name: game.name,
                            header: game.header,
                            playtimeTwoWeeks: game.playtimeTwoWeeksReadable,
                            playtimeForever: game.playtimeForeverReadable
                        }
                    });
                }
            });

            all(
                (function() {
                    var deferred = new Deferred();

                    cache.del(["roncli.com:steam:games"], function() {
                        cache.zadd("roncli.com:steam:games", gamesToAdd.map(function(game) {
                            return {
                                score: game.playtimeTwoWeeks * 1000000 + game.playtimeForever,
                                value: game
                            };
                        }), 86400, function() {
                            deferred.resolve(true);
                        });
                    });

                    return deferred.promise;
                }()),

                (function() {
                    var deferred = new Deferred();

                    cache.del(["roncli.com:steam:gameInfo"], function() {
                        cache.hmset("roncli.com:steam:gameInfo", gameInfo, 2592000, function() {
                            deferred.resolve(true);
                        });
                    });

                    return deferred.promise;
                }())
            ).then(
                function() {
                    callback();
                }
            );
        }).catch(function(err) {
            console.log("Bad response from Steam while retrieving games.");
            console.log(err);
            callback({
                error: "Bad response from Steam.",
                status: 502
            });
        });
    },

    /**
     * Caches a Steam game.
     * @param {number} gameId The Steam game ID.
     * @param {function} callback The callback function.
     */
    cacheGame = function(gameId, callback) {
        "use strict";

        var nameDeferred = new Deferred(),
            schemaDeferred = new Deferred(),
            statsDeferred = new Deferred(),

            /**
             * Get game name from cache.
             * @param {function} failureCallback The failure callback function.
             */
            getGame = function(failureCallback) {
                cache.hmget("roncli.com:steam:gameInfo", [gameId], function(games) {
                    if (games && games.length > 0 && games[0]) {
                        nameDeferred.resolve(true);
                        return;
                    }

                    failureCallback();
                });
            };

        // Get the game name.
        getGame(function() {
            cacheGames(function(err) {
                if (err) {
                    nameDeferred.reject(err);
                    return;
                }

                getGame(function() {
                    nameDeferred.reject({
                        error: "Steam game does not exist.",
                        status: 400
                    });
                });
            });
        });

        // Get the game schema.
        userStats.GetSchemaForGame(gameId).then(function(schema) {
            if (schema.availableGameStats) {
                schemaDeferred.resolve(schema);
            } else {
                schemaDeferred.resolve({availableGameStats: {achievements: []}});
            }
        }).catch(function(err) {
            if (err.response.statusCode === 400) {
                schemaDeferred.resolve({availableGameStats: {achievements: []}});
                return;
            }
            console.log("Bad response from Steam while retrieving game schema.");
            console.log(err);
            schemaDeferred.reject({
                error: "Bad response from Steam.",
                status: 502
            });
        });

        // Get the stats.
        userStats.GetUserStatsForGame(gameId, "76561197996696153").then(function(stats) {
            statsDeferred.resolve(stats);
        }).catch(function(err) {
            if (err.response.statusCode === 400) {
                statsDeferred.resolve({achievements: []});
                return;
            }
            console.log("Bad response from Steam while retrieving user stats for game.");
            console.log(err);
            statsDeferred.reject({
                error: "Bad response from Steam.",
                status: 502
            });
        });

        all([nameDeferred, schemaDeferred, statsDeferred]).then(
            function(results) {
                cache.set("roncli.com:steam:game:" + gameId, {schema: results[1], stats: results[2]}, 86400, function() {
                    callback();
                });
            },

            function(err) {
                callback(err);
            }
        );
    };

/**
 * Ensures that the Steam games are cached.
 * @param {boolean} force Forces the caching of the Steam games.
 * @param {function} callback The callback function.
 */
module.exports.cacheGames = function(force, callback) {
    "use strict";

    if (force) {
        cacheGames(callback);
        return;
    }

    cache.keys("roncli.com:steam:games", function(keys) {
        if (keys && keys > 0) {
            callback();
            return;
        }

        cacheGames(callback);
    });
};

/**
 * Ensures that a Steam game is cached.
 * @param {boolean} force Forces the caching of the Steam games.
 * @param {number} gameId The Steam game ID.
 * @param {function} callback The callback function.
 */
module.exports.cacheGame = function(force, gameId, callback) {
    "use strict";

    if (force) {
        cacheGame(gameId, callback);
        return;
    }

    cache.keys("roncli.com:steam:game:" + gameId, function(keys) {
        if (keys && keys > 0) {
            callback();
            return;
        }

        cacheGame(gameId, callback);
    });
};
