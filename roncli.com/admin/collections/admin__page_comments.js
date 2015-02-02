var Comment = require("../models/admin__page_comment"),
    Collection = require("app/collections/base");

module.exports = Collection.extend({
    model: Comment,
    url: "/admin/pages/comments"
});

module.exports.id = "Admin_PageComments";
