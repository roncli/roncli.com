var Model = require("./base");

module.exports = Model.extend({
    url: "/youtube/get-latest-dcl-playlist",
    idAttribute: "playlistId"
});

module.exports.id = "DclLatestPlaylist";
