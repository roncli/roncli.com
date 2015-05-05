var config = require("../privateConfig").steam,
    steam = require("steam-api"),
    userStats = new steam.UserStats(config.apikey, "76561197996696153"),
    player = new steam.Player(config.apikey, "76561197996696153"),
    cache = require("../cache/cache"),

    /**
     * Gets the Steam games.
     * @param callback The callback function.
     */
    getGames = function(callback) {
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
            console.log(games);
        });
    };

module.exports.getGames = function(callback) {
    getGames(callback);
};
