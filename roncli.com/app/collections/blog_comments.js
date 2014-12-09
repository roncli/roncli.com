var Comment = require("../models/blog_comment"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Comment,
    url: function() {
        "use strict";
        
        return "/blog-comment" + this.blogUrl;
    }
});

module.exports.id = "BlogComments";
