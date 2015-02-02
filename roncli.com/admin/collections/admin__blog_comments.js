var Comment = require("../models/admin__blog_comment"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: Comment,
    url: "/admin/blog/comments"
});

module.exports.id = "Admin_BlogComments";
