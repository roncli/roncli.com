var config = require("../privateConfig").steam,
    steam = require("steam-api"),
    userStats = new steam.UserStats(config.apikey, "76561197996696153"),
    player = new steam.Player(config.apikey, "76561197996696153"),
    cache = require("../cache/cache"),

    /**
     * Caches the Steam games.
     * @param callback The callback function.
     */
    cacheGames = function(callback) {
        "use strict";

        player.GetOwnedGames("76561197996696153", true, true).catch(function(err) {
            console.log("Bad response from Steam while retrieving games.");
            console.log(err);
            callback({
                error: "Bad response from Steam.",
                status: 502
            });
            return;
        }).done(function(games) {
            var gamesToAdd = [];
            games.forEach(function(game) {
                if (game.appId !== 2430 && game.playtimeForever > 0) {
                    gamesToAdd.push(game);
                }
            });

            cache.del(["roncli.com:steam:games"], function() {
                cache.zadd("roncli.com:steam:games", gamesToAdd.map(function(game) {
                    return {
                        score: game.playtimeTwoWeeks * 1000000 + game.playtimeForever,
                        value: game
                    };
                }), 86400, callback);
            });
        });
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
