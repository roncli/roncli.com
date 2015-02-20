var SongTag = require("../models/song_tag"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: SongTag,
    url: "/song-tag"
});

module.exports.id = "SongTags";
