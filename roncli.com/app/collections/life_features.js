var Feature = require("../models/life_feature"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Feature,
    url: "/life-feature"
});

module.exports.id = "LifeFeatures";
