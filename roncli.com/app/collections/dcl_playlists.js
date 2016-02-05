var Playlist = require("../models/dcl_playlist"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Playlist,
    url: "/youtube/get-dcl-playlists"
});

module.exports.id = "DclPlaylists";
