var Comment = require("../models/playlist_comment"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Comment,
    url: function() {
        "use strict";

        return "/playlist-comment?id=" + this.playlistId;
    }
});

module.exports.id = "PlaylistComments";
