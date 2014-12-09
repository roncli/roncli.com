var Tweet = require("../models/tweet"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Tweet,
    url: "/tweet"
});

module.exports.id = "Tweets";
