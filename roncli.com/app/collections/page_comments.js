var Comment = require("../models/page_comment"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Comment,
    url: function() {
        "use strict";

        return "/page-comment?pageId=" + this.pageId;
    }
});

module.exports.id = "PageComments";
