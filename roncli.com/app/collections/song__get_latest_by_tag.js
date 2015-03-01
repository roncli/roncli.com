var Song = require("../models/song"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Song,
    url: "/song/get-latest/:tag"
});

module.exports.id = "Song_GetLatestByTag";
