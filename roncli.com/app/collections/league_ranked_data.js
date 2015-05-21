var Ranked = require("../models/league_ranked"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Ranked,
    url: "/league-ranked"
});

module.exports.id = "LeagueRankedData";
