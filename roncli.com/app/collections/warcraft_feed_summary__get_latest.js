var Summary = require("../models/warcraft_feed_summary"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Summary,
    url: "/warcraft-feed/get-latest"
});

module.exports.id = "WarcraftFeedSummary_GetLatest";
