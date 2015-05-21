var Blog = require("../models/blog"),
    Collection = require("./base");

module.exports = Collection.extend({
    model: Blog,
    url: "/blog/getLatest"
});

module.exports.id = "Blog_GetLatest";
