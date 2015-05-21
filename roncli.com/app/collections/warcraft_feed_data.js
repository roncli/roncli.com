var Feed = require("../models/warcraft_feed"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Feed,
    url: "/warcraft-feed"
});

module.exports.id = "WarcraftFeedData";
