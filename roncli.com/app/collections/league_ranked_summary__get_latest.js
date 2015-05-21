var Summary = require("../models/league_ranked_summary"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Summary,
    url: "/league-ranked/get-latest"
});

module.exports.id = "LeagueRankedSummary_GetLatest";
