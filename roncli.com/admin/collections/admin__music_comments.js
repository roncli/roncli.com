var Comment = require("../models/admin__music_comment"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: Comment,
    url: "/admin/music/comments"
});

module.exports.id = "Admin_MusicComments";
