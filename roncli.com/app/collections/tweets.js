var Tweet = require("../models/tweet"),
    Collection = require("rendr/shared/base/collection");

module.exports = Collection.extend({
    model: Tweet,
    url: "/tweet"
});

module.exports.id = "Tweets";
