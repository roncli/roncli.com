var Comment = require("../models/admin__youtube_comment"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: Comment,
    url: "/admin/youtube/comments"
});

module.exports.id = "Admin_YoutubeComments";
