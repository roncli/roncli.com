var Game = require("../models/steam_game"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Game,
    url: "/steam-game"
});

module.exports.id = "SteamGames";
