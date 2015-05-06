var Playlist = require("../models/admin__playlist"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: Playlist,
    url: "/admin/youtube/playlist"
});

module.exports.id = "Admin_Playlists";
